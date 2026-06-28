import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Col, Row, Table, TableProps, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import "./Stock.scss";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { getProducts } from "../../features/productSlice";
import { UpsertStockModal } from "./upsert-stock-modal/UpsertStockModal";
import { getAllStocks, setSelectedProduct } from "../../features/stockSlice";
import { IProduct } from "../../types/product";
import { useAppSelector } from "../../hooks/storeHooks";
import { useTranslation } from "react-i18next";

export interface IProductWithStock extends IProduct {
  quantity: number;
}

export const Stock = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isProductsFetched, products } = useSelector(
    (state: RootState) => state.product
  );
  const { isStockFetched, products_stock } = useSelector(
    (state: RootState) => state.stock
  );
  const { company } = useAppSelector((state) => state.company);
  const { t } = useTranslation();

  const [showUpserStockModal, setShowUpserStockModal] = useState(false);
  const [isAddStock, setIsAddStock] = useState(true);

  const mergedProducts: IProductWithStock[] = useMemo(
    () =>
      products.map((product) => {
        const productStock = products_stock.find(
          (s) => s.productId === product.id
        );
        return {
          ...product,
          quantity: productStock ? productStock.quantity : 0,
        };
      }),
    [products, products_stock]
  );

  const columns: TableProps<IProductWithStock>["columns"] = [
    {
      title: t("Stock.number"),
      dataIndex: "index",
      key: "index",
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    {
      title: t("Stock.productImage"),
      dataIndex: "image",
      key: "image",
      render: (_, record) => {
        return (
          <img
            src={record.image}
            alt={record.name}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              objectFit: "cover",
              marginRight: 10,
              boxShadow:
                "rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px",
            }}
          />
        );
      },
    },
    {
      title: t("Stock.name"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("Stock.productQuantity"),
      dataIndex: "quantity",
      key: "quantity",
      render: (_: unknown, render) => (
        <span
          style={{ fontWeight: "bold", fontSize: "1.25em", marginLeft: "30px" }}
        >
          {render.quantity}
        </span>
      ),
    },
    {
      title: t("Stock.addRemoveQuantity"),
      key: "actions",
      render: (_, render) => (
        <Row
          gutter={16}
          align="middle"
          style={{ marginLeft: "10px" }}
          className="stock-action-buttons-row"
        >
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => {
              setIsAddStock(true);
              setShowUpserStockModal(true);
              dispatch(setSelectedProduct(render));
            }}
          />
          <Button
            size="large"
            style={{ marginLeft: "10px" }}
            type="primary"
            danger
            icon={<MinusOutlined />}
            onClick={() => {
              setIsAddStock(false);
              setShowUpserStockModal(true);
              dispatch(setSelectedProduct(render));
            }}
          />
        </Row>
      ),
    },
  ];

  useEffect(() => {
    if (!isProductsFetched && company?.id) {
      dispatch(getProducts({ companyId: company?.id }));
    }
  }, [isProductsFetched]);

  useEffect(() => {
    if (!isStockFetched && company?.id) {
      dispatch(getAllStocks(company?.id));
    }
  }, [isStockFetched]);

  return (
    <div className="stock-layout">
      <Row justify={"space-between"} align={"middle"}>
        <Col>
          <Typography.Title level={2} className="title">
            {t("Stock.title")}
          </Typography.Title>
        </Col>
        <Col>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => {
              setShowUpserStockModal(true);
              setIsAddStock(true);
            }}
          >
            {t("Stock.createButton")}
          </Button>
        </Col>
      </Row>
      {showUpserStockModal ? (
        <UpsertStockModal
          isAddStock={isAddStock}
          onClose={() => {
            setShowUpserStockModal(false);
            dispatch(setSelectedProduct(undefined));
            setIsAddStock(true);
          }}
          open={showUpserStockModal}
        />
      ) : null}
      <Table
        columns={columns}
        rowKey={"id"}
        dataSource={mergedProducts}
        pagination={false}
        className="scrollable-table"
        style={{ marginTop: "20px" }}
      />
    </div>
  );
};
