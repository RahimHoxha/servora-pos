import { Divider, Modal, Row, Typography } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { payTable, setSelectedTable } from "../../features/tablesSlice";
import { refetchStocks } from "../../features/stockSlice";
import { ITables } from "../../types/tables";
import { useAppSelector } from "../../hooks/storeHooks";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useIsTablet } from "../../hooks/useIsTablet";
import { useTranslation } from "react-i18next";

interface IProps {
  open: boolean;
  onCancel: () => void;
  onPayConfirmed: (data: ITables) => void;
}

export const PayModal = ({ open, onCancel, onPayConfirmed }: IProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  const { selectedTable } = useSelector((state: RootState) => state.tables);
  const { company } = useAppSelector((state) => state.company);
  const { t } = useTranslation();

  const total =
    selectedTable?.products.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0
    ) ?? 0;

  const onSubmit = () => {
    if (!selectedTable?.id || !company?.id) return;

    dispatch(payTable({ id: selectedTable?.id, companyId: company?.id }))
      .unwrap()
      .then(({ data }) => {
        dispatch(setSelectedTable(undefined));
        dispatch(refetchStocks());
        onPayConfirmed(data);
        onCancel();
      })
      .catch(() => {});
  };

  return (
    <Modal
      title={t("Tables.PayModal.title")}
      open={open}
      onOk={onSubmit}
      onCancel={onCancel}
      okText={t("Tables.PayModal.confirm")}
      cancelText={t("Tables.PayModal.cancel")}
      centered={!isMobile}
      width={isMobile ? "100%" : isTablet ? "90%" : 520}
      okButtonProps={{ size: "large", block: isMobile }}
      cancelButtonProps={{ size: "large", block: isMobile }}
      styles={{
        body: {
          maxHeight: isMobile ? "calc(100vh - 220px)" : "60vh",
          overflowY: "auto",
        },
      }}
    >
      {selectedTable?.tableNumber ? (
        <Typography.Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
          {t("Tables.PayModal.table")}:{" "}
          <Typography.Text strong>
            {String(selectedTable.tableNumber).padStart(2, "0")}
          </Typography.Text>
        </Typography.Text>
      ) : null}

      {selectedTable?.products?.map((item) => (
        <Row
          key={item.id}
          style={{ marginTop: 10, padding: "8px 0" }}
          align="middle"
          wrap={false}
        >
          <img
            src={item.product.image}
            width={isMobile ? 40 : 48}
            height={isMobile ? 40 : 48}
            alt={item.product.name}
            style={{
              borderRadius: 10,
              objectFit: "cover",
              flexShrink: 0,
            }}
          />
          <Typography.Text style={{ marginLeft: 12, fontSize: isMobile ? "0.95em" : "1.05em" }}>
            {item.product.name}{" "}
            <Typography.Text strong>
              {item.quantity} x {item.product.price} Den
            </Typography.Text>
          </Typography.Text>
        </Row>
      ))}

      <Divider />

      <Typography.Title
        level={isMobile ? 4 : 3}
        style={{ textAlign: "center", margin: "8px 0 0" }}
      >
        {t("Tables.PayModal.totalPrice")} {total} Den
      </Typography.Title>
    </Modal>
  );
};
