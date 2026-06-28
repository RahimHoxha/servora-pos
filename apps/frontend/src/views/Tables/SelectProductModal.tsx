import { SearchOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Input,
  Modal,
  Row,
  Tag,
  Typography,
} from "antd";
import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IProductWithStock } from "../Stock/Stock";
import { AppDispatch, RootState } from "../../store";
import { setSelectedTable } from "../../features/tablesSlice";
import { ITables } from "../../types/tables";
import { reservedProductQuantities } from "../../hooks/reservedProductQuantities";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useIsTablet } from "../../hooks/useIsTablet";
import { useTranslation } from "react-i18next";
import {
  getProductServingLabel,
  isProductAvailableNow,
} from "../../utils/productAvailability";
import "./SelectProductModal.scss";

interface IProps {
  open: boolean;
  onClose: () => void;
}

export const SelectProductModal = ({ open, onClose }: IProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const { t } = useTranslation();

  const { selectedTable, in_progress_tables } = useSelector(
    (state: RootState) => state.tables
  );

  const { product_categories, products } = useSelector(
    (state: RootState) => state.product
  );
  const { products_stock } = useSelector((state: RootState) => state.stock);

  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");

  const allProductCategories = useMemo(
    () => [{ id: "all", name: t("Products.all") }, ...product_categories],
    [product_categories, t]
  );

  const reservedQuantities = useMemo(
    () =>
      reservedProductQuantities(
        in_progress_tables.filter((item) => item.id !== selectedTable?.id)
      ),
    [in_progress_tables, selectedTable]
  );

  const productsByCategory = useMemo(() => {
    if (activeFilter === "all") return products;
    return products.filter((item) =>
      item.product_categories?.some((cat) => cat.id === activeFilter)
    );
  }, [products, activeFilter]);

  const mergedProducts: IProductWithStock[] = useMemo(
    () =>
      productsByCategory.map((product) => {
        const productStock = products_stock.find(
          (s) => s.productId === product.id
        );
        return {
          ...product,
          quantity: productStock ? productStock.quantity : 0,
        };
      }),
    [productsByCategory, products_stock]
  );

  const onProductSelect = (product: IProductWithStock, checked: boolean) => {
    if (!checked) {
      dispatch(
        setSelectedTable({
          ...selectedTable,
          products: selectedTable?.products.filter(
            (item) => item.product.id !== product.id
          ),
        } as unknown as ITables)
      );
      return;
    }
    dispatch(
      setSelectedTable({
        ...selectedTable,
        products: [
          ...(selectedTable?.products || []),
          { id: Math.random().toString(), quantity: 1, product },
        ],
      } as unknown as ITables)
    );
  };

  const selectedCount = selectedTable?.products?.length ?? 0;

  return (
    <Modal
      title={t("Tables.selectProductModalTitle")}
      open={open}
      onCancel={onClose}
      centered={!isMobile}
      width={isMobile ? "100%" : isTablet ? "92%" : 960}
      className="select-product-modal"
      destroyOnClose
      footer={
        <Row justify="space-between" align="middle" gutter={[8, 8]}>
          <Col xs={24} sm={12}>
            <Typography.Text type="secondary">
              {t("Tables.selectProductSelectedCount", { count: selectedCount })}
            </Typography.Text>
          </Col>
          <Col xs={24} sm={12} style={{ textAlign: isMobile ? "left" : "right" }}>
            <Button type="primary" size="large" block={isMobile} onClick={onClose}>
              {t("Tables.selectProductDrawerDone")}
            </Button>
          </Col>
        </Row>
      }
      styles={{
        body: {
          maxHeight: isMobile ? "calc(100vh - 180px)" : "70vh",
          overflowY: "auto",
          padding: isMobile ? "12px 8px" : "16px 4px",
        },
      }}
    >
      <Input
        addonBefore={<SearchOutlined />}
        size="large"
        placeholder={t("Products.searchPlaceholder")}
        allowClear
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="select-product-modal__categories">
        {allProductCategories.map((filter) => (
          <Button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`select-product-modal__category${
              activeFilter === filter.id
                ? " select-product-modal__category--active"
                : ""
            }`}
          >
            {filter.name}
          </Button>
        ))}
      </div>

      <Row gutter={[8, 8]} className="select-product-modal__grid">
        {mergedProducts
          .filter((item) =>
            item.name.toLowerCase().includes(search.toLowerCase())
          )
          .map((item) => {
            const remainingStock =
              item.quantity - (reservedQuantities[item.id] || 0);
            const isAvailableNow = isProductAvailableNow(item);
            const isOutOfStock = remainingStock === 0;
            const isDisabled = isOutOfStock || !isAvailableNow;
            const servingLabel = getProductServingLabel(item, t);
            const isSelected = selectedTable?.products.some(
              (product) => product.product.id === item.id
            );

            return (
              <Col
                xs={12}
                sm={12}
                md={8}
                lg={6}
                key={item.id}
              >
                <Card
                  hoverable={!isDisabled}
                  className={`select-product-modal__card${
                    isSelected ? " select-product-modal__card--selected" : ""
                  }${isDisabled ? " select-product-modal__card--disabled" : ""}`}
                  onClick={() => {
                    if (!isDisabled) onProductSelect(item, !isSelected);
                  }}
                >
                  {isOutOfStock && (
                    <div className="select-product-modal__overlay select-product-modal__overlay--stock">
                      {t("Products.outOfStock")}
                    </div>
                  )}
                  {!isOutOfStock && !isAvailableNow && (
                    <div className="select-product-modal__overlay">
                      {t("Products.outsideServingHours")}
                      {servingLabel ? (
                        <span className="select-product-modal__overlay-sub">
                          {servingLabel}
                        </span>
                      ) : null}
                    </div>
                  )}

                  <Row justify="space-between" align="middle">
                    <Checkbox
                      disabled={isDisabled}
                      checked={isSelected}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation();
                        if (!isDisabled) onProductSelect(item, e.target.checked);
                      }}
                    />
                    {!isDisabled ? (
                      remainingStock <= 10 ? (
                        <Tag color="red">
                          {remainingStock} {t("Products.lastItems")}
                        </Tag>
                      ) : (
                        <Tag color="green">{t("Products.available")}</Tag>
                      )
                    ) : servingLabel ? (
                      <Tag>{servingLabel}</Tag>
                    ) : null}
                  </Row>

                  <div className="select-product-modal__card-body">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="select-product-modal__image"
                    />
                    <Typography.Text
                      strong
                      className="select-product-modal__name"
                      ellipsis
                    >
                      {item.name}
                    </Typography.Text>
                    <Typography.Text strong className="select-product-modal__price">
                      {item.price} Den
                    </Typography.Text>
                  </div>
                </Card>
              </Col>
            );
          })}
      </Row>
    </Modal>
  );
};
