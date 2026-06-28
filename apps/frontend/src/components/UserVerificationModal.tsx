import { SafetyOutlined } from "@ant-design/icons";
import { Input, message, Modal, Typography } from "antd";
import { useAppDispatch, useAppSelector } from "../hooks/storeHooks";
import { getCompanyUserByCode } from "../features/userSlice";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

interface IProps {
  open: boolean;
  onClose: () => void;
}

export const UserVerificationModal = ({ open, onClose }: IProps) => {
  const dispatch = useAppDispatch();
  const { company } = useAppSelector((state) => state.company);
  const { selectedUser } = useAppSelector((state) => state.user);
  const [messageApi, contextHolder] = message.useMessage();
  const otpContainerRef = useRef<HTMLDivElement | null>(null);
  const { t } = useTranslation();

  const onVerify = (value: string) => {
    if (!company?.id || !value) return;
    dispatch(getCompanyUserByCode({ companyId: company?.id, userCode: value }))
      .unwrap()
      .then(() => {
        onClose();
      })
      .catch(() => {
        messageApi.open({
          type: "error",
          content: t("Common.UserVerificationModal.error"),
        });
      });
  };

  useEffect(() => {
    if (open && otpContainerRef.current) {
      const input = otpContainerRef.current.querySelector("input");
      input?.focus();
    }
  }, [open]);

  return (
    <Modal
      open={open && !selectedUser?.id}
      footer={null}
      closable
      centered
      onCancel={onClose}
      styles={{ body: { textAlign: "center", padding: "40px 24px" } }}
    >
      {contextHolder}
      <div style={{ marginBottom: 24 }}>
        <SafetyOutlined style={{ fontSize: 92, color: "#999" }} />
      </div>
      <Typography.Title level={5}>
        {t("Common.UserVerificationModal.title")}
      </Typography.Title>
      <Typography.Text type="secondary">
        {t("Common.UserVerificationModal.description")}
      </Typography.Text>
      <div ref={otpContainerRef}>
        <Input.OTP
          mask="🔒"
          length={4}
          size="large"
          style={{ width: "100%", marginTop: "20px" }}
          autoFocus
          onChange={onVerify}
        />
      </div>
    </Modal>
  );
};
