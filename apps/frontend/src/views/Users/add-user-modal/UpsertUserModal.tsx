import { UserOutlined } from "@ant-design/icons";
import { Drawer, Form, Input, message } from "antd";
import { useForm } from "antd/es/form/Form";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { changePassword, createUser } from "../../../features/userSlice";
import { ICreateUserBody } from "../../../types/user";
import { useAppSelector } from "../../../hooks/storeHooks";
import { useTranslation } from "react-i18next";
import { DrawerFooter } from "../../../components/DrawerFooter";
import { useIsMobile } from "../../../hooks/useIsMobile";

interface IProps {
  userId?: string;
  open: boolean;
  onClose: () => void;
}

export const UpsertUserModal = ({ open, userId, onClose }: IProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [form] = useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const { company } = useAppSelector((state) => state.company);
  const { loading, selectedUser } = useSelector(
    (state: RootState) => state.user
  );

  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const onSubmit = () => {
    return selectedUser?.id ? onChangePassword() : onCreate();
  };

  const onCreate = () => {
    form
      .validateFields()
      .then((values: ICreateUserBody) => {
        if (!company?.id) return;

        if (values.password !== values.confirm_password) {
          messageApi.open({
            type: "error",
            content: t("Users.UpsertUserModal.passwordsNotMatch"),
          });
          return;
        }

        dispatch(createUser({ ...values, companyId: company?.id }))
          .unwrap()
          .then(() => {
            messageApi.open({
              type: "success",
              content: t("Users.UpsertUserModal.successCreate"),
            });
            onClose();
          })
          .catch(() => {
            messageApi.open({
              type: "error",
              content: t("Users.UpsertUserModal.error"),
            });
          });
      })
      .catch(() => {});
  };

  const onChangePassword = () => {
    if (!company?.id) return;
    form.validateFields().then((values: ICreateUserBody) => {
      if (!selectedUser?.id) return;
      if (values.password !== values.confirm_password) {
        messageApi.open({
          type: "error",
          content: t("Users.UpsertUserModal.passwordsNotMatch"),
        });
        return;
      }
      dispatch(
        changePassword({
          companyId: company?.id,
          body: {
            userId: selectedUser?.id,
            newPassword: values.password,
            confirmNewPassword: values.confirm_password,
          },
        })
      )
        .unwrap()
        .then(() => {
          messageApi.open({
            type: "success",
            content: t("Users.UpsertUserModal.successPassword"),
          });
          onClose();
        })
        .catch(() => {
          messageApi.open({
            type: "error",
            content: t("Users.UpsertUserModal.error"),
          });
        })
        .catch(() => {});
    });
  };

  return (
    <Drawer
      title={
        userId
          ? t("Users.UpsertUserModal.editTitle")
          : t("Users.UpsertUserModal.createTitle")
      }
      open={open}
      onClose={onClose}
      width={isMobile ? "100%" : 440}
      destroyOnClose
      footer={
        <DrawerFooter
          onCancel={onClose}
          onSubmit={onSubmit}
          loading={loading}
          cancelText={t("Users.UpsertUserModal.cancel")}
          submitText={
            userId
              ? t("Users.UpsertUserModal.okEdit")
              : t("Users.UpsertUserModal.okCreate")
          }
        />
      }
    >
      {contextHolder}
      <Form layout="vertical" requiredMark={false} form={form} name="login">
        <Form.Item
          label={t("Users.UpsertUserModal.usernameLabel")}
          name="username"
          initialValue={selectedUser?.username}
          rules={[{ required: true }]}
        >
          <Input
            size="large"
            prefix={<UserOutlined />}
            defaultValue={selectedUser?.username}
            disabled={selectedUser?.id !== undefined}
            placeholder={t("Users.UpsertUserModal.usernamePlaceholder")}
          />
        </Form.Item>

        <Form.Item
          label={t("Users.UpsertUserModal.passwordLabel")}
          name="password"
          rules={[{ required: true }]}
        >
          <Input.OTP
            mask="🔒"
            length={4}
            size="large"
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item
          label={t("Users.UpsertUserModal.confirmPasswordLabel")}
          name="confirm_password"
          rules={[{ required: true }]}
        >
          <Input.OTP
            mask="🔒"
            length={4}
            size="large"
            style={{ width: "100%" }}
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
};
