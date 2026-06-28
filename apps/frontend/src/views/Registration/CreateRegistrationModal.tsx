import { Col, Drawer, Form, InputNumber, Row } from "antd";
import { useEffect, useMemo } from "react";
import { getProducts } from "../../features/productSlice";
import { getAllStocks } from "../../features/stockSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { IProductWithStock } from "../Stock/Stock";
import { useForm } from "antd/es/form/Form";
import { createRegistration } from "../../features/registrationSlice";
import { resetUserExpenses } from "../../features/userExpenseSlice";
import { useAppSelector } from "../../hooks/storeHooks";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useIsTablet } from "../../hooks/useIsTablet";
import "./CreateRegistrationModal.scss";
import { useTranslation } from "react-i18next";
import { DrawerFooter } from "../../components/DrawerFooter";

interface IProps {
  open: boolean;
  onCancel: () => void;
}

export const CreateRegistrationModal = ({ open, onCancel }: IProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [form] = useForm();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const { t } = useTranslation();

  const { isProductsFetched, products } = useSelector(
    (state: RootState) => state.product
  );
  const { isStockFetched, products_stock } = useSelector(
    (state: RootState) => state.stock
  );
  const { company } = useAppSelector((state) => state.company);

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

  const onSubmit = () => {
    if (!company?.id) return;

    form
      .validateFields()
      .then((values) => {
        dispatch(
          createRegistration({ payload: values.fields, companyId: company?.id })
        )
          .unwrap()
          .then(() => {
            dispatch(resetUserExpenses());
            onCancel();
          })
          .catch(() => { });
      })
      .catch(() => { });
  };

  useEffect(() => {
    if (!isProductsFetched && company?.id) {
      dispatch(getProducts({ companyId: company?.id }));
    }
  }, [isProductsFetched]);

  useEffect(() => {
    if (!isStockFetched && company?.id) {
      dispatch(getAllStocks(company?.id));
    }
  }, [isStockFetched, company?.id]);

  return (
    <Drawer
      title={t("Registration.CreateRegistrationModal.title")}
      open={open}
      onClose={onCancel}
      width={isMobile ? "100%" : isTablet ? "90%" : 720}
      destroyOnClose
      className="create-registration-modal"
      footer={
        <DrawerFooter
          onCancel={onCancel}
          onSubmit={onSubmit}
          cancelText={t("Registration.CreateRegistrationModal.cancel")}
          submitText={t("Registration.CreateRegistrationModal.ok")}
        />
      }
    >
      <Form layout="vertical" requiredMark={false} form={form}>
        <div
          style={{
            maxHeight: isMobile || isTablet ? "60vh" : "auto",
            overflowY: isMobile || isTablet ? "auto" : "visible",
            paddingRight: isMobile || isTablet ? "8px" : "0",
          }}
        >
          {mergedProducts.map((item, index) => (
            <Row
              key={item.id}
              align={"middle"}
              className="product-row"
              style={{
                marginTop: isMobile || isTablet ? "8px" : "10px",
                marginBottom: isMobile || isTablet ? "16px" : "0",
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                gap: window.innerWidth <= 425 ? "0" : "32px",
                alignItems: window.innerWidth <= 425 ? "flex-start" : "center",
              }}
            >
              <Form.Item
                hidden
                name={["fields", index, "product", "productId"]}
                initialValue={item.id}
              />
              <Form.Item
                hidden
                name={["fields", index, "product", "name"]}
                initialValue={item.name}
              />
              <Form.Item
                hidden
                name={["fields", index, "product", "image"]}
                initialValue={item.image}
              />
              <Form.Item
                hidden
                name={["fields", index, "product", "price"]}
                initialValue={item.price}
              />

              <Row
                align={"middle"}
                className="product-info"
                style={{ flex: "0 0 auto" }}
              >
                <Col>
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: isMobile ? 40 : isTablet ? 48 : 54,
                      height: isMobile ? 40 : isTablet ? 48 : 54,
                      borderRadius: 8,
                      objectFit: "cover",
                      marginRight: isMobile ? 8 : isTablet ? 12 : 10,
                      marginTop: isMobile ? "4px" : isTablet ? "6px" : "8px",
                    }}
                  />
                </Col>
                <Col>
                  <span
                    style={{
                      fontSize: isMobile
                        ? "1.1em"
                        : isTablet
                          ? "1.3em"
                          : "1.5em",
                      fontWeight: "700",
                      display: "block",
                    }}
                  >
                    {item.name}
                  </span>
                  <span
                    style={{
                      fontSize: isMobile ? "0.9em" : isTablet ? "1em" : "1em",
                      color: "#666",
                    }}
                  >
                    {item.price} Den
                  </span>
                </Col>
              </Row>
              <Row
                className="input-row"
                style={{
                  gap: window.innerWidth > 635 ? "0px" : "16px",
                  flex: 1,
                  minWidth: 0,
                  justifyContent: "flex-end",
                }}
              >
                <Form.Item
                  label="Malli në sistem"
                  initialValue={item.quantity}
                  style={{
                    marginBottom: "16px",
                    marginRight: "16px",
                  }}
                >
                  <InputNumber
                    size={isMobile || isTablet ? "middle" : "large"}
                    disabled
                    value={item.quantity}
                    style={{
                      alignContent: "center",
                      width: isMobile || isTablet ? "100%" : "auto",
                    }}
                  />
                </Form.Item>
                <Form.Item
                  label="Malli në dyqan"
                  name={["fields", index, "quantity"]}
                  rules={[
                    { required: true, message: "Please enter a quantity" },
                  ]}
                  style={{ marginBottom: isMobile || isTablet ? "0" : "24px" }}
                >
                  <InputNumber
                    size={isMobile || isTablet ? "middle" : "large"}
                    style={{ width: isMobile || isTablet ? "100%" : "auto" }}
                  />
                </Form.Item>
              </Row>
            </Row>
          ))}
        </div>
      </Form>
    </Drawer>
  );
};
