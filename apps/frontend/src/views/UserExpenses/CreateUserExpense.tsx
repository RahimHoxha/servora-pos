import { Drawer, Form, Input, InputNumber, Select } from "antd";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { useForm } from "antd/es/form/Form";
import { reservedProductQuantities } from "../../hooks/reservedProductQuantities";
import { IProductWithStock } from "../Stock/Stock";
import {
  ICreateUserExpsensePayload,
  IUserExpenseType,
} from "../../types/user-expense";
import { createUserExpense } from "../../features/userExpenseSlice";
import { refetchStocks } from "../../features/stockSlice";
import { useAppSelector } from "../../hooks/storeHooks";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useTranslation } from "react-i18next";
import { isProductAvailableNow } from "../../utils/productAvailability";
import { DrawerFooter } from "../../components/DrawerFooter";

interface IProps {
  open: boolean;
  onClose: () => void;
}

export const CreateUserExpense = ({ open, onClose }: IProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [form] = useForm();
  const isMobile = useIsMobile();

  const { selectedUser } = useSelector((state: RootState) => state.user);
  const { products } = useSelector((state: RootState) => state.product);
  const { in_progress_tables } = useSelector(
    (state: RootState) => state.tables
  );
  const { products_stock } = useSelector((state: RootState) => state.stock);
  const { company } = useAppSelector((state) => state.company);
  const { t } = useTranslation();

  const type = Form.useWatch("type", form);
  const productId = Form.useWatch("productId", form);
  const productQuantity = Form.useWatch("quantity", form);

  const reservedQuantities = useMemo(
    () => reservedProductQuantities(in_progress_tables),
    [in_progress_tables, products, products_stock]
  );

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
    [products_stock, reservedQuantities, products, in_progress_tables]
  );

  const onSubmit = () => {
    if (!selectedUser?.id || !company?.id) return;

    form
      .validateFields()
      .then((values: ICreateUserExpsensePayload) => {
        dispatch(
          createUserExpense({
            ...values,
            companyId: company?.id,
            userId: selectedUser?.id,
          })
        )
          .unwrap()
          .then(() => {
            dispatch(refetchStocks());
            onClose();
          })
          .catch(() => { });
      })
      .catch(() => { });
  };

  return (
    <Drawer
      title={t("UserExpenses.CreateUserExpense.title")}
      open={open}
      onClose={onClose}
      width={isMobile ? "100%" : 480}
      destroyOnClose
      footer={
        <DrawerFooter
          onCancel={onClose}
          onSubmit={onSubmit}
          cancelText={t("UserExpenses.CreateUserExpense.cancelText")}
          submitText={t("UserExpenses.CreateUserExpense.okText")}
        />
      }
    >
      <Form layout="vertical" requiredMark={false} form={form} name="stock">
        <Form.Item
          label={t("UserExpenses.CreateUserExpense.typeLabel")}
          name={"type"}
          initialValue={IUserExpenseType.PRODUCT}
        >
          <Select
            options={[
              {
                label: t("UserExpenses.CreateUserExpense.typeProduct"),
                value: IUserExpenseType.PRODUCT,
              },
              {
                label: t("UserExpenses.CreateUserExpense.typeCash"),
                value: IUserExpenseType.CASH,
              },
            ]}
            size="large"
          />
        </Form.Item>

        {type === IUserExpenseType.PRODUCT ? (
          <Form.Item
            label={t("UserExpenses.CreateUserExpense.productLabel")}
            name="productId"
            rules={[{ required: true }]}
          >
            <Select
              size="large"
              showSearch
              options={mergedProducts.map((item) => ({
                disabled:
                  item.quantity - Number(reservedQuantities[item.id] || 0) <= 0 ||
                  !isProductAvailableNow(item),
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
              placeholder={t("UserExpenses.CreateUserExpense.productLabel")}
            />
          </Form.Item>
        ) : null}

        {type === IUserExpenseType.PRODUCT ? (
          <Form.Item
            label={t("UserExpenses.CreateUserExpense.quantityLabel")}
            name="quantity"
            rules={[
              {
                required: true,
                message: t("UserExpenses.CreateUserExpense.quantityRequired"),
              },
              {
                type: "number",
                min: 1,
                message: t("UserExpenses.CreateUserExpense.quantityMin"),
              },
              {
                type: "number",
                max:
                  Number(
                    mergedProducts.find((item) => productId === item.id)
                      ?.quantity
                  ) - Number(reservedQuantities[productId] || 0),
                message: t("UserExpenses.CreateUserExpense.quantityMax"),
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              size="large"
              placeholder={t("UserExpenses.CreateUserExpense.quantityLabel")}
              min={1}
              autoFocus={true}
              addonAfter={
                productQuantity &&
                  mergedProducts?.find((item) => productId === item?.id)?.price
                  ? Number(
                    Number(
                      mergedProducts?.find((item) => productId === item?.id)
                        ?.price
                    ) * productQuantity
                  ) + " Den"
                  : undefined
              }
            />
          </Form.Item>
        ) : null}

        {type === IUserExpenseType.CASH ? (
          <Form.Item
            label={t("UserExpenses.CreateUserExpense.cashLabel")}
            name="cashAmount"
            rules={[
              {
                required: true,
                message: t("UserExpenses.CreateUserExpense.cashRequired"),
              },
              {
                type: "number",
                min: 1,
                message: t("UserExpenses.CreateUserExpense.cashMin"),
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              size="large"
              placeholder={t("UserExpenses.CreateUserExpense.cashLabel")}
              min={1}
              addonAfter={"Den"}
            />
          </Form.Item>
        ) : null}

        <Form.Item
          label={t("UserExpenses.CreateUserExpense.reasonLabel")}
          name="description"
        >
          <Input.TextArea
            rows={4}
            size="large"
            placeholder={t("UserExpenses.CreateUserExpense.reasonPlaceholder")}
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
};
