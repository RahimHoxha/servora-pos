import { Drawer, Form, Input, InputNumber, Select, Button, TimePicker, Typography } from "antd";
import { useTranslation } from "react-i18next";
import dayjs, { Dayjs } from "dayjs";

import { IProductPayload } from "../../../types/product";
import { useForm } from "antd/es/form/Form";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store";
import {
  createProduct,
  createProductCategory,
  setSelectedProduct,
  updateProduct,
} from "../../../features/productSlice";
import { useAppSelector } from "../../../hooks/storeHooks";
import { DrawerFooter } from "../../../components/DrawerFooter";
import { useIsMobile } from "../../../hooks/useIsMobile";

interface IProps {
  open: boolean;
  onClose: () => void;
}

export const UpsertProductModal = ({ open, onClose }: IProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [form] = useForm();
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const { product_categories, selectedProduct } = useAppSelector(
    (state) => state.product
  );
  const { company } = useAppSelector((state) => state.company);

  const [newCategory, setNewCategory] = useState("");

  const formatTimeValue = (value?: Dayjs | null) =>
    value ? value.format("HH:mm") : null;

  const parseTimeValue = (value?: string | null) =>
    value ? dayjs(value, "HH:mm") : null;

  const onSubmit = () => {
    return !selectedProduct?.id ? onCreate() : onUpdate();
  };

  const onCreate = () => {
    if (!company?.id) return;
    form
      .validateFields()
      .then((values: IProductPayload & { availableFromTime?: Dayjs; availableUntilTime?: Dayjs }) => {
        dispatch(
          createProduct({
            ...values,
            companyId: company?.id,
            availableFromTime: formatTimeValue(values.availableFromTime),
            availableUntilTime: formatTimeValue(values.availableUntilTime),
          })
        )
          .unwrap()
          .then(() => {
            onCancel();
          })
          .catch(() => {});
      })
      .catch(() => {});
  };

  const onUpdate = () => {
    if (!selectedProduct?.id || !company?.id) return;
    form
      .validateFields()
      .then((values: IProductPayload & { availableFromTime?: Dayjs; availableUntilTime?: Dayjs }) => {
        dispatch(
          updateProduct({
            companyId: company?.id,
            body: {
              id: selectedProduct?.id,
              body: {
                ...values,
                availableFromTime: formatTimeValue(values.availableFromTime),
                availableUntilTime: formatTimeValue(values.availableUntilTime),
              },
            },
          })
        )
          .unwrap()
          .then(() => {
            onCancel();
          })
          .catch(() => {});
      })
      .catch(() => {});
  };

  const onCancel = () => {
    dispatch(setSelectedProduct(undefined));
    onClose();
  };

  const handleAddCategory = () => {
    if (
      newCategory &&
      !product_categories.some((item) => item.name === newCategory) &&
      company?.id
    ) {
      dispatch(
        createProductCategory({ name: newCategory, companyId: company?.id })
      )
        .unwrap()
        .then(() => {
          setNewCategory("");
        })
        .catch(() => {});
    }
  };

  useEffect(() => {
    if (selectedProduct?.id) {
      form.setFieldsValue({
        ...selectedProduct,
        product_categories:
          selectedProduct?.product_categories?.map((item) => item.id) ?? [],
        availableFromTime: parseTimeValue(selectedProduct.availableFromTime),
        availableUntilTime: parseTimeValue(selectedProduct.availableUntilTime),
      });
    } else {
      form.resetFields();
    }
  }, [selectedProduct?.id, form]);

  return (
    <Drawer
      title={
        selectedProduct?.id
          ? t("Products.UpsertProductModal.editTitle")
          : t("Products.UpsertProductModal.createTitle")
      }
      open={open}
      onClose={onCancel}
      width={isMobile ? "100%" : 480}
      destroyOnClose
      footer={
        <DrawerFooter
          onCancel={onCancel}
          onSubmit={onSubmit}
          cancelText={t("Products.UpsertProductModal.cancel")}
          submitText={
            selectedProduct?.id
              ? t("Products.UpsertProductModal.okEdit")
              : t("Products.UpsertProductModal.okCreate")
          }
        />
      }
    >
      <Form layout="vertical" requiredMark={false} form={form}>
        <Form.Item
          label={t("Products.UpsertProductModal.nameLabel")}
          name="name"
          rules={[{ required: true }]}
        >
          <Input
            size="large"
            placeholder={t("Products.UpsertProductModal.namePlaceholder")}
          />
        </Form.Item>

        <Form.Item
          label={t("Products.UpsertProductModal.imageLabel")}
          name="image"
          rules={[{ required: true }]}
        >
          <Input
            size="large"
            placeholder={t("Products.UpsertProductModal.imagePlaceholder")}
          />
        </Form.Item>

        <Form.Item
          label={t("Products.UpsertProductModal.priceLabel")}
          name="price"
          rules={[{ required: true }]}
        >
          <InputNumber
            style={{ width: "100%" }}
            size="large"
            addonAfter={"Den"}
            placeholder={t("Products.UpsertProductModal.pricePlaceholder")}
          />
        </Form.Item>

        <Form.Item
          label={t("Products.UpsertProductModal.categoryLabel")}
          name="product_categories"
        >
          <Select
            size="large"
            mode="multiple"
            style={{ width: "100%" }}
            placeholder={t("Products.UpsertProductModal.categoryPlaceholder")}
            dropdownRender={(menu) => (
              <>
                {menu}
                <div style={{ display: "flex", padding: "8px", gap: "8px" }}>
                  <Input
                    placeholder={t(
                      "Products.UpsertProductModal.addCategoryPlaceholder"
                    )}
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onPressEnter={handleAddCategory}
                  />
                  <Button
                    type="primary"
                    onClick={handleAddCategory}
                    disabled={!newCategory.trim()}
                  >
                    {t("Products.UpsertProductModal.addCategoryButton")}
                  </Button>
                </div>
              </>
            )}
          >
            {product_categories.map((category) => (
              <Select.Option key={category.id} value={category.id}>
                {category.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Typography.Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
          {t("Products.UpsertProductModal.servingHoursHint")}
        </Typography.Text>

        <Form.Item
          label={t("Products.UpsertProductModal.availableFromLabel")}
          name="availableFromTime"
        >
          <TimePicker
            size="large"
            format="HH:mm"
            style={{ width: "100%" }}
            placeholder={t("Products.UpsertProductModal.availableFromPlaceholder")}
            needConfirm={false}
          />
        </Form.Item>

        <Form.Item
          label={t("Products.UpsertProductModal.availableUntilLabel")}
          name="availableUntilTime"
        >
          <TimePicker
            size="large"
            format="HH:mm"
            style={{ width: "100%" }}
            placeholder={t("Products.UpsertProductModal.availableUntilPlaceholder")}
            needConfirm={false}
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
};
