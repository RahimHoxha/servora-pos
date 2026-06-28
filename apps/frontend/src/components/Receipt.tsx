import { RefObject } from "react";
import { Divider, Typography, Image } from "antd";
import { ITables } from "../types/tables";
import { useAppSelector } from "../hooks/storeHooks";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

const { Title, Text } = Typography;

const formatTableNumber = (tableNumber?: number) =>
  tableNumber ? String(tableNumber).padStart(2, "0") : "-";

export const Receipt = ({
  ref,
  data,
}: {
  ref: RefObject<HTMLDivElement | null>;
  data: ITables;
}) => {
  const { t } = useTranslation();
  const { company } = useAppSelector((state) => state.company);

  return (
    <div className="receipt-print" ref={ref}>
      <Title level={4} style={{ textAlign: "center", marginTop: 0 }}>
        {company?.name}
      </Title>

      {company?.logo ? (
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <Image width={72} height={72} src={company.logo} preview={false} />
        </div>
      ) : null}

      {company?.phone ? (
        <Text
          type="secondary"
          style={{ display: "block", textAlign: "center", marginBottom: 12 }}
        >
          {company.phone}
        </Text>
      ) : null}

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <Text strong>{t("Tables.PayModal.date")}</Text>
        <Text>{dayjs().format("DD/MM/YYYY HH:mm")}</Text>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <Text strong>{t("Tables.PayModal.table")}</Text>
        <Text>{formatTableNumber(data.tableNumber)}</Text>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <Text strong>{t("Tables.PayModal.waiter")}</Text>
        <Text>{data?.user?.username}</Text>
      </div>

      <Divider style={{ margin: "12px 0" }} />

      {(data?.products || []).map((item, index) => (
        <div
          key={index}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto auto",
            gap: 8,
            marginBottom: 8,
            alignItems: "center",
          }}
        >
          <Text>{item?.product?.name}</Text>
          <Text>x{item?.quantity}</Text>
          <Text style={{ textAlign: "right" }}>
            {item?.quantity * item?.product?.price} Den
          </Text>
        </div>
      ))}

      <Divider style={{ margin: "12px 0" }} />

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Text strong>{t("Tables.PayModal.total")}</Text>
        <Text strong>{data.sumTotal} Den</Text>
      </div>

      <Divider dashed style={{ margin: "16px 0 12px" }} />

      <Text
        type="secondary"
        style={{ display: "block", textAlign: "center" }}
      >
        {t("Tables.PayModal.thankYou")}
      </Text>
    </div>
  );
};
