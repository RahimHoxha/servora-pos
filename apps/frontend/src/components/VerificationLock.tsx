import { Button, Row, Typography } from "antd";
import { LockOutlined, UnlockOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../hooks/storeHooks";
import { setSelectedUser } from "../features/userSlice";
import { resetUserExpenses } from "../features/userExpenseSlice";
import { useEffect } from "react";
interface IProps {
  noPaddingRight?: boolean;
  onShowVerificationModal: (value: boolean) => void;
}

export const VerificationLock = ({
  noPaddingRight,
  onShowVerificationModal,
}: IProps) => {
  const dispatch = useAppDispatch();
  const { selectedUser } = useAppSelector((state) => state.user);

  const onButtonClick = () => {
    if (selectedUser?.id) {
      onShowVerificationModal(false);
      dispatch(setSelectedUser(undefined));
      dispatch(resetUserExpenses());
      return;
    }
    onShowVerificationModal(true);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onShowVerificationModal(false);
        dispatch(setSelectedUser(undefined));
        dispatch(resetUserExpenses());
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <Row
      style={{
        paddingLeft: "20px",
        paddingRight: noPaddingRight ? "0px" : "20px",
      }}
      align={"middle"}
    >
      <Typography.Title level={4} style={{ margin: 0, paddingRight: "10px" }}>
        {selectedUser?.id ? selectedUser?.username : null}
      </Typography.Title>
      <Button
        type="primary"
        icon={selectedUser?.id ? <UnlockOutlined /> : <LockOutlined />}
        size="large"
        style={{ background: selectedUser?.id ? "#30d372" : "#f5222d" }}
        onClick={onButtonClick}
      />
    </Row>
  );
};
