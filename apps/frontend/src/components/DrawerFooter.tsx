import { Button, Space } from "antd";

interface DrawerFooterProps {
  onCancel: () => void;
  onSubmit: () => void;
  cancelText: string;
  submitText: string;
  loading?: boolean;
  danger?: boolean;
}

export const DrawerFooter = ({
  onCancel,
  onSubmit,
  cancelText,
  submitText,
  loading,
  danger,
}: DrawerFooterProps) => (
  <Space style={{ width: "100%", justifyContent: "flex-end" }}>
    <Button size="large" onClick={onCancel}>
      {cancelText}
    </Button>
    <Button
      size="large"
      type="primary"
      danger={danger}
      loading={loading}
      onClick={onSubmit}
    >
      {submitText}
    </Button>
  </Space>
);
