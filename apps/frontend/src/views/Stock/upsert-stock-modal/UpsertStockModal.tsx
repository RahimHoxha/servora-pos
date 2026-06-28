import { Drawer, Form, InputNumber, Select } from "antd";
import { useForm } from "antd/es/form/Form";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store";
import { IProductStockPayload } from "../../../types/stock";
import {
  addProductStock,
  reduceProductStock,
  setSelectedProduct,
} from "../../../features/stockSlice";
import { useAppSelector } from "../../../hooks/storeHooks";
import { useTranslation } from "react-i18next";
import { DrawerFooter } from "../../../components/DrawerFooter";
import { useIsMobile } from "../../../hooks/useIsMobile";

interface IProps {
  open: boolean;
  isAddStock: boolean;
  onClose: () => void;
}

export const UpsertStockModal = ({ open, isAddStock, onClose }: IProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { products } = useAppSelector((state) => state.product);
  const { selectedProduct } = useAppSelector((state) => state.stock);
  const { company } = useAppSelector((state) => state.company);
  const [form] = useForm();
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const onSubmit = () => {
    return isAddStock ? onAddStock() : onRemoveStock();
  };

  const onAddStock = () => {
    if (!company?.id) return;
    form
      .validateFields()
      .then((values: IProductStockPayload) => {
        dispatch(addProductStock({ ...values, companyId: company?.id }))
          .unwrap()
          .then(() => {
            onCancel();
          })
          .catch(() => {});
      })
      .catch(() => {});
  };

  const onRemoveStock = () => {
    if (!company?.id) return;

    form
      .validateFields()
      .then((values: IProductStockPayload) => {
        dispatch(reduceProductStock({ ...values, companyId: company?.id }))
          .unwrap()
          .then(() => {
            onCancel();
          })
          .catch(() => {});
      })
      .catch(() => {});
  };

  const onCancel = () => {
    form.resetFields();
    dispatch(setSelectedProduct(undefined));
    onClose();
  };

  return (
    <Drawer
      title={
        isAddStock
          ? t("Stock.UpsertStockModal.addTitle")
          : t("Stock.UpsertStockModal.removeTitle")
      }
      open={open}
      onClose={onCancel}
      width={isMobile ? "100%" : 440}
      destroyOnClose
      footer={
        <DrawerFooter
          onCancel={onCancel}
          onSubmit={onSubmit}
          danger={!isAddStock}
          cancelText={t("Stock.UpsertStockModal.cancel")}
          submitText={
            isAddStock
              ? t("Stock.UpsertStockModal.okAdd")
              : t("Stock.UpsertStockModal.okRemove")
          }
        />
      }
    >
      <Form layout="vertical" requiredMark={false} form={form} name="stock">
        <Form.Item
          label={t("Stock.UpsertStockModal.productLabel")}
          name="productId"
          rules={[{ required: true }]}
          initialValue={selectedProduct?.id}
        >
          <Select
            disabled={selectedProduct?.id ? true : false}
            size="large"
            showSearch
            options={products.map((item) => ({
              label: (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      objectFit: "cover",
                      marginRight: 10,
                    }}
                  />
                  <span style={{ flex: 1, fontWeight: "500" }}>
                    {item.name}
                  </span>
                  <span style={{ fontWeight: "bold" }}>{item.price} Den</span>
                </div>
              ),
              value: item.id,
            }))}
            placeholder={t("Stock.UpsertStockModal.productPlaceholder")}
          />
        </Form.Item>

        <Form.Item
          label={t("Stock.UpsertStockModal.quantityLabel")}
          name="quantity"
          rules={[
            {
              required: true,
              message: t("Stock.UpsertStockModal.quantityRequired"),
            },
            {
              type: "number",
              min: 1,
              message: t("Stock.UpsertStockModal.quantityMin"),
            },
          ]}
        >
          <InputNumber
            style={{ width: "100%" }}
            size="large"
            placeholder={t("Stock.UpsertStockModal.quantityPlaceholder")}
            min={1}
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
};
