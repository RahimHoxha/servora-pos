import { LockOutlined } from "@ant-design/icons";
import React, { useMemo } from "react";
import { useAppSelector } from "../hooks/storeHooks";

type LockWrapperProps = {
  children: React.ReactNode;
  iconSize?: number;
  onClick: () => void;
};

export const LockWrapper: React.FC<LockWrapperProps> = ({
  children,
  iconSize,
  onClick,
}) => {
  const { selectedUser } = useAppSelector((state) => state.user);
  const disabled = useMemo(() => !selectedUser?.id, [selectedUser]);
  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        width: "100%",
        cursor: disabled ? "pointer" : "default",
      }}
      onClick={() => {
        if (disabled) onClick();
      }}
    >
      <div
        style={{
          pointerEvents: disabled ? "none" : "auto",
          filter: disabled ? "grayscale(50%)" : "none",
          opacity: disabled ? 0 : 1,
          transition: "all 0.3s ease",
        }}
      >
        {children}
      </div>

      {disabled && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "8px",
            pointerEvents: "auto",
            zIndex: 10,
          }}
        >
          <LockOutlined style={{ fontSize: iconSize ?? 64 }} />
        </div>
      )}
    </div>
  );
};
