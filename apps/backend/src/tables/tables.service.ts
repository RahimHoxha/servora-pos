import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { OrderStatus, Table } from "./tables.entity";
import { CreateTableDto, UpdateTableDto } from "./create-update-tables.dto";
import { Product } from "src/product/product.entity";
import { TableProduct } from "./table-product.entity";
import { ProductStockService } from "src/product-stock/product-stock.service";
import { User } from "src/user/user.entity";
import { MoveOrderDto } from "./move-order.dto";
import { TablesGateway } from "./tables.gateway";
import { isProductAvailableNow } from "src/product/product-availability.util";

@Injectable()
export class TablesService {
  constructor(
    @InjectRepository(Table)
    private readonly tablesRepository: Repository<Table>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(TableProduct)
    private readonly tableProductsRepository: Repository<TableProduct>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly productStockService: ProductStockService,
    private readonly tablesGateway: TablesGateway
  ) {}

  async create(
    companyId: string,
    createTableDto: CreateTableDto
  ): Promise<Table> {
    const { userId, products, tableNumber, status } = createTableDto;

    let sumTotal = 0;
    const tableProducts: TableProduct[] = [];

    for (const item of products) {
      const product = await this.productsRepository.findOne({
        where: {
          id: item.productId,
          company: {
            id: companyId,
          },
        },
      });
      if (!product)
        throw new NotFoundException(
          `Product with id ${item.productId} not found`
        );

      this.ensureProductIsAvailable(product);

      sumTotal += product.price * item.quantity;

      const tableProduct = this.tableProductsRepository.create({
        product,
        quantity: item.quantity,
      });
      tableProducts.push(tableProduct);
    }

    const table = this.tablesRepository.create({
      tableNumber,
      user: { id: userId },
      status,
      sumTotal,
      acceptedAt: new Date(),
      company: {
        id: companyId,
      },
    });

    const savedTable = await this.tablesRepository.save(table);

    for (const tableProduct of tableProducts) {
      tableProduct.table = savedTable;
      await this.tableProductsRepository.save(tableProduct);
    }

    const updatedTables = await this.findAll(companyId, status);
    this.tablesGateway.server
      .to(`company-${companyId}`)
      .emit("tables:update", updatedTables);

    return this.findOne(companyId, savedTable.id);
  }

  async findAll(companyId: string, status?: OrderStatus): Promise<Table[]> {
    return await this.tablesRepository.find({
      where: {
        status,
        company: {
          id: companyId,
        },
      },
      relations: ["products", "products.product", "user"],
      order: {
        paidAt: "ASC",
      },
    });
  }

  async findOne(companyId: string, id: string): Promise<Table> {
    const table = await this.tablesRepository.findOne({
      where: {
        id,
        company: {
          id: companyId,
        },
      },
      relations: ["user", "products", "products.product"],
    });

    if (!table) throw new NotFoundException(`Table with id ${id} not found`);
    return table;
  }

  async update(
    companyId: string,
    id: string,
    updateTableDto: UpdateTableDto
  ): Promise<Table> {
    const { userId, products, tableNumber, status } = updateTableDto;

    const table = await this.tablesRepository.findOne({
      where: { id },
      relations: ["products"],
    });

    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!table) {
      throw new NotFoundException(`Table with id ${id} not found`);
    }

    let sumTotal = 0;
    const tableProducts: TableProduct[] = [];

    for (const item of products || []) {
      const product = await this.productsRepository.findOne({
        where: { id: item.productId },
      });
      if (!product)
        throw new NotFoundException(
          `Product with id ${item.productId} not found`
        );

      this.ensureProductIsAvailable(product);

      sumTotal += product.price * item.quantity;

      const existingTableProduct = table.products.find(
        (tp) => tp.product.id === item.productId
      );

      if (existingTableProduct) {
        existingTableProduct.quantity = item.quantity;
        tableProducts.push(existingTableProduct);
      } else {
        const newTableProduct = this.tableProductsRepository.create({
          product,
          quantity: item.quantity,
        });
        tableProducts.push(newTableProduct);
      }
    }

    if (!tableNumber || !userId || !status || !user) {
      throw new BadGatewayException("Error");
    }

    table.tableNumber = tableNumber;
    table.user = user;
    table.status = status;
    table.sumTotal = sumTotal;

    const updatedTable = await this.tablesRepository.save(table);

    for (const tableProduct of tableProducts) {
      tableProduct.table = updatedTable;
      await this.tableProductsRepository.save(tableProduct);
    }

    const productsToRemove = table.products.filter(
      (tp) => !tableProducts.some((upd) => upd.product.id === tp.product.id)
    );
    for (const productToRemove of productsToRemove) {
      await this.tableProductsRepository.remove(productToRemove);
    }

    const changedTable = this.findOne(companyId, updatedTable.id);

    const updatedTables = await this.findAll(companyId, status);
    this.tablesGateway.server
      .to(`company-${companyId}`)
      .emit("tables:update", updatedTables);

    return changedTable;
  }

  async payTable(companyId: string, id: string): Promise<Table> {
    const table = await this.tablesRepository.findOne({
      where: {
        id,
        company: {
          id: companyId,
        },
      },
      relations: ["products", "products.product", "user", "company"],
    });

    if (!table) {
      throw new NotFoundException(`Table with id ${id} not found`);
    }

    if (table.status !== OrderStatus.IN_PROGRESS) {
      throw new BadGatewayException("Table is not in progress");
    }

    for (const tableProduct of table.products) {
      try {
        await this.productStockService.reduceStock(
          companyId,
          tableProduct.product.id,
          tableProduct.quantity
        );
      } catch (error) {
        throw new BadGatewayException(
          `Error updating stock for ${tableProduct.product.name}: ${error}`
        );
      }
    }

    table.status = OrderStatus.PAID;
    table.paidAt = new Date();

    const paidTable = await this.tablesRepository.save(table);
    const updatedTables = await this.findAll(
      companyId,
      OrderStatus.IN_PROGRESS
    );
    this.tablesGateway.server
      .to(`company-${companyId}`)
      .emit("tables:update", updatedTables);
    return paidTable;
  }

  async moveOrder(companyId: string, dto: MoveOrderDto): Promise<Table> {
    const { fromTableNumber, toTableNumber } = dto;

    if (fromTableNumber === toTableNumber) {
      throw new BadRequestException(
        "Source and destination tables cannot be the same"
      );
    }

    // 1) Load source order
    const fromOrder = await this.tablesRepository.findOne({
      where: {
        status: OrderStatus.IN_PROGRESS,
        tableNumber: fromTableNumber,
        company: { id: companyId },
      },
      relations: ["products", "products.product"],
    });

    if (!fromOrder) {
      throw new NotFoundException(`No order found on table ${fromTableNumber}`);
    }

    // 2) Load (or not) destination order
    const toOrder = await this.tablesRepository.findOne({
      where: {
        status: OrderStatus.IN_PROGRESS,
        tableNumber: toTableNumber,
        company: { id: companyId },
      },
    });

    // 2a) If target is empty, just move the whole order
    if (!toOrder) {
      fromOrder.tableNumber = toTableNumber;
      const saved = await this.tablesRepository.save(fromOrder);
      // reload with relations and return

      const updatedTables = await this.findAll(
        companyId,
        OrderStatus.IN_PROGRESS
      );
      this.tablesGateway.server
        .to(`company-${companyId}`)
        .emit("tables:update", updatedTables);

      return this.tablesRepository.findOneOrFail({
        where: { id: saved.id },
        relations: ["products", "products.product", "user", "company"],
      });
    }

    // 3) Destination exists: merge one-by-one
    for (const srcTp of fromOrder.products) {
      const existing = await this.tableProductsRepository.findOne({
        where: {
          table: { id: toOrder.id },
          product: { id: srcTp.product.id },
        },
      });

      if (existing) {
        existing.quantity += srcTp.quantity;
        await this.tableProductsRepository.save(existing);
      } else {
        const newTp = this.tableProductsRepository.create({
          table: { id: toOrder.id },
          product: srcTp.product,
          quantity: srcTp.quantity,
        });
        await this.tableProductsRepository.save(newTp);
      }
    }

    // 4) remove the entire source order (and its products via cascade)
    await this.remove(companyId, fromOrder.id);

    const updatedToOrder = await this.tablesRepository.findOneOrFail({
      where: { id: toOrder.id },
      relations: ["products", "products.product", "user", "company"],
    });

    // Recalculate sumTotal
    updatedToOrder.sumTotal = updatedToOrder.products.reduce(
      (total, tp) => total + tp.quantity * tp.product.price,
      0
    );

    // Save updated sumTotal
    await this.tablesRepository.save(updatedToOrder);

    const updatedTables = await this.findAll(
      companyId,
      OrderStatus.IN_PROGRESS
    );
    this.tablesGateway.server
      .to(`company-${companyId}`)
      .emit("tables:update", updatedTables);

    return updatedToOrder;
  }

  async remove(companyId: string, id: string): Promise<void> {
    const result = await this.tablesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Table with id ${id} not found`);
    }

    const updatedTables = await this.findAll(
      companyId,
      OrderStatus.IN_PROGRESS
    );
    this.tablesGateway.server
      .to(`company-${companyId}`)
      .emit("tables:update", updatedTables);
  }

  private ensureProductIsAvailable(product: Product): void {
    if (!isProductAvailableNow(product)) {
      throw new BadRequestException(
        `${product.name} is not available at this time.`
      );
    }
  }
}
