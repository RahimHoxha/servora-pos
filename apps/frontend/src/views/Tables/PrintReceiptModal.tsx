import { Button, Drawer, Result, Space, Typography } from "antd";
import { ITables } from "../../types/tables";
import { useTranslation } from "react-i18next";
import { Receipt } from "../../components/Receipt";
import { useRef } from "react";

import {
  Br,
  Cut,
  Line,
  Printer,
  Text,
  Row,
  render,
} from "react-thermal-printer";

import dayjs from "dayjs";
import { TFunction } from "i18next";
import { ICompany } from "../../types/company";
import { useAppDispatch, useAppSelector } from "../../hooks/storeHooks";
import { setPort } from "../../features/companySlice";
import { ThreeColumnRow } from "./ThreeColumnRow";
import { useIsMobile } from "../../hooks/useIsMobile";

const formatTableNumber = (tableNumber?: number) =>
  tableNumber ? String(tableNumber).padStart(2, "0") : "-";

// eslint-disable-next-line react-refresh/only-export-components
export const getReceipt = ({
  data,
  company,
  t,
}: {
  data: ITables;
  company?: ICompany;
  t: TFunction;
}) => {
  return (
    <Printer type="epson" width={48} characterSet="slovenia">
      {company?.name && (
        <Text align="center" bold size={{ width: 2, height: 2 }}>
          {company.name}
        </Text>
      )}

      <Br />

      {company?.phone ? (
        <>
          <Text align="center">{company.phone}</Text>
          <Br />
        </>
      ) : null}

      <Row
        left={t("Tables.PayModal.date")}
        right={dayjs().format("DD/MM/YYYY HH:mm")}
      />
      <Row
        left={t("Tables.PayModal.table")}
        right={formatTableNumber(data.tableNumber)}
      />
      <Row left={t("Tables.PayModal.waiter")} right={data?.user?.username} />

      <Line />

      {(data?.products || []).map((item, index) => (
        <ThreeColumnRow
          key={index}
          left={item.product?.name?.slice(0, 18) ?? ""}
          center={`x${item.quantity}`}
          right={`${item.quantity * item.product?.price} Den`}
          width={48}
        />
      ))}

      <Line />

      <Row left={t("Tables.PayModal.total")} right={`${data.sumTotal} Den`} />

      <Line />

      <Text align="center">{t("Tables.PayModal.thankYou")}</Text>

      <Cut />
    </Printer>
  );
};

interface IProps {
  open: boolean;
  data: ITables;
  onClose: () => void;
}

export const PrintReceiptModal = ({ open, data, onClose }: IProps) => {
  const { t } = useTranslation();
  const contentRef = useRef<HTMLDivElement>(null);
  const { company, port } = useAppSelector((state) => state.company);
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();

  const print = async () => {
    const printData = await render(getReceipt({ data, company, t }));

    let _port = port;
    if (_port == null) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      _port = await (navigator as any).serial.requestPort();
      await _port.open({ baudRate: 9600 });
      dispatch(setPort(_port));
    }

    const writer = _port.writable?.getWriter();

    if (writer != null) {
      try {
        await writer.write(printData);
      } catch (e) {
        console.log("Print error", e);
      }
      writer.releaseLock();
    }
  };

  return (
    <Drawer
      title={t("Tables.PrintReceiptModal.title")}
      open={open}
      onClose={onClose}
      width={isMobile ? "100%" : 420}
      destroyOnClose
      footer={
        <Space style={{ width: "100%", justifyContent: "stretch" }}>
          <Button size="large" block onClick={onClose}>
            {t("Tables.PrintReceiptModal.close")}
          </Button>
          <Button type="primary" size="large" block onClick={print}>
            {t("Tables.PrintReceiptModal.print")}
          </Button>
        </Space>
      }
    >
      <Result
        status="success"
        title={t("Tables.PrintReceiptModal.success")}
        style={{ padding: "12px 0 24px" }}
      />

      <Typography.Text type="secondary" style={{ display: "block", marginBottom: 12 }}>
        {t("Tables.PrintReceiptModal.preview")}
      </Typography.Text>

      <Receipt ref={contentRef} data={data} />
    </Drawer>
  );
};
