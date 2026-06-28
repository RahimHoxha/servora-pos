import { Drawer, Form, Input, message } from "antd";
import { useForm } from "antd/es/form/Form";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DrawerFooter } from "../../components/DrawerFooter";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useAppSelector } from "../../hooks/storeHooks";
import * as CompanyServices from "../../services/company.service";

interface ChangeAdminPasswordDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const ChangeAdminPasswordDrawer = ({
  open,
  onClose,
}: ChangeAdminPasswordDrawerProps) => {
  const [form] = useForm();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const { company } = useAppSelector((state) => state.company);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const onSubmit = () => {
    form
      .validateFields()
      .then(async (values) => {
        if (!company?.id) return;

        if (values.newPassword !== values.confirmNewPassword) {
          messageApi.error(t("Settings.ChangePasswordDrawer.passwordsNotMatch"));
          return;
        }

        setLoading(true);

        try {
          await CompanyServices.changeAdminPassword(company.id, {
            currentPassword: values.currentPassword,
            newPassword: values.newPassword,
            confirmNewPassword: values.confirmNewPassword,
          });

          messageApi.success(t("Settings.ChangePasswordDrawer.success"));
          handleClose();
        } catch (error: unknown) {
          const apiMessage =
            (error as { response?: { data?: { message?: string | string[] } } })
              ?.response?.data?.message ?? "";

          const messageText = Array.isArray(apiMessage)
            ? apiMessage[0]
            : apiMessage;

          if (
            messageText.toLowerCase().includes("current password is incorrect")
          ) {
            messageApi.error(
              t("Settings.ChangePasswordDrawer.wrongCurrentPassword")
            );
          } else if (
            messageText.toLowerCase().includes("passwords do not match")
          ) {
            messageApi.error(t("Settings.ChangePasswordDrawer.passwordsNotMatch"));
          } else if (
            messageText
              .toLowerCase()
              .includes("must be different from the current password")
          ) {
            messageApi.error(
              t("Settings.ChangePasswordDrawer.sameAsCurrentPassword")
            );
          } else {
            messageApi.error(
              messageText || t("Settings.ChangePasswordDrawer.error")
            );
          }
        } finally {
          setLoading(false);
        }
      })
      .catch(() => {});
  };

  return (
    <>
      {contextHolder}
      <Drawer
        title={t("Settings.ChangePasswordDrawer.title")}
        open={open}
        onClose={handleClose}
        width={isMobile ? "100%" : 420}
        destroyOnClose
        footer={
          <DrawerFooter
            onCancel={handleClose}
            onSubmit={onSubmit}
            cancelText={t("Settings.ChangePasswordDrawer.cancel")}
            submitText={t("Settings.ChangePasswordDrawer.save")}
            loading={loading}
          />
        }
      >
        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item
            name="currentPassword"
            label={t("Settings.ChangePasswordDrawer.currentPassword")}
            rules={[{ required: true }]}
          >
            <Input.Password size="large" autoComplete="current-password" />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label={t("Settings.ChangePasswordDrawer.newPassword")}
            rules={[
              { required: true },
              { min: 6, message: t("Settings.ChangePasswordDrawer.minLength") },
            ]}
          >
            <Input.Password size="large" autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            name="confirmNewPassword"
            label={t("Settings.ChangePasswordDrawer.confirmPassword")}
            rules={[{ required: true }]}
          >
            <Input.Password size="large" autoComplete="new-password" />
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};
