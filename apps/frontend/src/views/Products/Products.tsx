import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Row,
  Col,
  Button,
  Card,
  Typography,
  Input,
  Popconfirm,
  Empty,
} from "antd";
import "./Products.scss";
import { useEffect, useMemo, useState } from "react";
import { UpsertProductModal } from "./upser-product-modal/UpsertProductModal";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import {
  deleteProduct,
  getProductCategories,
  getProducts,
  setSelectedProduct,
} from "../../features/productSlice";
import { useAppSelector } from "../../hooks/storeHooks";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useTranslation } from "react-i18next";
import { getProductServingLabel } from "../../utils/productAvailability";

export const Products = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isMobile = useIsMobile();

  const {
    isProductsFetched,
    isProductCategoriesFetched,
    products,
    product_categories,
  } = useSelector((state: RootState) => state.product);
  const { company } = useAppSelector((state) => state.company);
  const { t } = useTranslation();

  const [openModal, setOpenModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");

  const allProductCategories = useMemo(
    () => [{ id: "all", name: t("Products.all") }, ...product_categories],
    [product_categories, t]
  );

  const productsByCategory = useMemo(() => {
    if (activeFilter === "all") return products;
    return products.filter((item) =>
      item.product_categories?.some((cat) => cat.id === activeFilter)
    );
  }, [products, activeFilter, search]);

  useEffect(() => {
    if (!isProductCategoriesFetched && company?.id) {
      dispatch(getProductCategories(company?.id));
    }
  }, [isProductCategoriesFetched, company?.id]);

  useEffect(() => {
    if (!isProductsFetched && company?.id) {
      dispatch(getProducts({ companyId: company?.id }));
    }
  }, [isProductsFetched, company?.id]);

  const filteredProducts = productsByCategory.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="products-layout">
      <Row className="products-header" justify="space-between" align="middle">
        <Col>
          <Typography.Title level={2} className="title">
            {t("Products.title")}
          </Typography.Title>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setOpenModal(true)}
            size={isMobile ? "middle" : "large"}
          >
            {t("Products.createButton")}
          </Button>
        </Col>
      </Row>

      <Row className="products-filters" gutter={[16, 16]}>
        <Col xs={24} md={18}>
          <Row className="category-filters" gutter={[8, 8]}>
            {allProductCategories.map((filter) => (
              <Col key={filter.id}>
                <Button
                  onClick={() => setActiveFilter(filter.id)}
                  type={activeFilter === filter.id ? "primary" : "default"}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    borderRadius: "999px",
                    padding: "10px 16px",
                    width: "auto",
                    minWidth: isMobile ? "88px" : "110px",
                  }}
                >
                  <Typography.Text
                    style={{
                      fontWeight:
                        activeFilter === filter.id ? "bold" : "normal",
                    }}
                  >
                    {filter.name}
                  </Typography.Text>
                </Button>
              </Col>
            ))}
          </Row>
        </Col>
        <Col xs={24} md={6}>
          <Input
            placeholder={t("Products.searchPlaceholder")}
            className="search-input"
            size={isMobile ? "middle" : "large"}
            onChange={(e) => setSearch(e.target.value)}
            addonAfter={<SearchOutlined />}
          />
        </Col>
      </Row>

      <Row className="products-grid" gutter={[16, 16]}>
        {filteredProducts.length ? (
          filteredProducts.map((item) => (
            <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
              <Card
                actions={[
                  <EditOutlined
                    key="edit"
                    onClick={() => {
                      dispatch(setSelectedProduct(item));
                      setOpenModal(true);
                    }}
                  />,
                  <Popconfirm
                    cancelText={t("Products.confirmDeleteCancel")}
                    okText={t("Products.confirmDeleteOk")}
                    title={t("Products.confirmDeleteTitle")}
                    description={t("Products.confirmDeleteDesc")}
                    icon={<QuestionCircleOutlined style={{ color: "red" }} />}
                    onConfirm={() => {
                      if (!company?.id) return;
                      dispatch(
                        deleteProduct({
                          id: item.id,
                          companyId: company?.id,
                        })
                      );
                    }}
                  >
                    <DeleteOutlined key="setting" />
                  </Popconfirm>,
                ]}
                hoverable
                className="product-card"
              >
                <div className="product-content">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="product-image"
                  />
                  <Typography.Title level={5} className="product-name">
                    {item.name}
                  </Typography.Title>
                  <Typography.Text strong className="product-price">
                    {item.price} Den
                  </Typography.Text>
                  {getProductServingLabel(item, t) ? (
                    <Typography.Text
                      type="secondary"
                      style={{ display: "block", marginTop: 8, fontSize: 12 }}
                    >
                      {getProductServingLabel(item, t)}
                    </Typography.Text>
                  ) : null}
                </div>
              </Card>
            </Col>
          ))
        ) : (
          <Col span={24}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t("Products.noProducts")}
              className="empty-state"
            >
              <Button type="primary" onClick={() => setOpenModal(true)}>
                {t("Products.createButton")}
              </Button>
            </Empty>
          </Col>
        )}
      </Row>

      {openModal && (
        <UpsertProductModal
          open={openModal}
          onClose={() => setOpenModal(false)}
        />
      )}
    </div>
  );
};
