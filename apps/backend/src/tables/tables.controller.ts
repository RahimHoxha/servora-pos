import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
} from "@nestjs/common";
import { TablesService } from "./tables.service";
import { UpdateTableDto, CreateTableDto } from "./create-update-tables.dto";
import { OrderStatus, Table } from "./tables.entity";
import { MoveOrderDto } from "./move-order.dto";
import { TablesGateway } from "./tables.gateway";

@Controller("tables")
export class TablesController {
  constructor(
    private readonly tablesService: TablesService,
    private readonly tablesGateway: TablesGateway
  ) {}

  @Post()
  async create(
    @Query("companyId") companyId: string,
    @Body() createTableDto: CreateTableDto
  ) {
    return this.tablesService.create(companyId, createTableDto);
  }

  @Get()
  async findAll(
    @Query("companyId") companyId: string,
    @Query("status") status?: OrderStatus
  ): Promise<Table[]> {
    const tables = await this.tablesService.findAll(companyId, status);

    // Emit data to WebSocket clients
    if (status === OrderStatus.IN_PROGRESS) {
      this.tablesGateway.server
        .to(`company-${companyId}`)
        .emit("tables:update", tables);
    }

    return tables;
  }

  @Get(":id")
  async findOne(
    @Query("companyId") companyId: string,
    @Param("id") id: string
  ) {
    return this.tablesService.findOne(companyId, id);
  }

  @Put(":id")
  async update(
    @Query("companyId") companyId: string,
    @Param("id") id: string,
    @Body() updateTableDto: UpdateTableDto
  ) {
    return this.tablesService.update(companyId, id, updateTableDto);
  }

  @Put(":id/pay")
  async payTable(
    @Query("companyId") companyId: string,
    @Param("id") id: string
  ) {
    return this.tablesService.payTable(companyId, id);
  }

  @Post("move")
  async moveOrder(
    @Query("companyId") companyId: string,
    @Body() moveOrderDto: MoveOrderDto
  ) {
    return this.tablesService.moveOrder(companyId, moveOrderDto);
  }

  @Delete(":id")
  async remove(@Query("companyId") companyId: string, @Param("id") id: string) {
    return this.tablesService.remove(companyId, id);
  }
}
