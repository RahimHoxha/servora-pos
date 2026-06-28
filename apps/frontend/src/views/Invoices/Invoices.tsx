import {
  Col,
  DatePicker,
  Row,
  Select,
  Table,
  TableProps,
  Typography,
} from "antd";
import "./Invoices.scss";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { useEffect, useState } from "react";
import { getPaidTables } from "../../features/tablesSlice";
import { ITables } from "../../types/tables";
import dayjs, { Dayjs } from "dayjs";
import { getUsers } from "../../features/userSlice";
import "dayjs/locale/sq";
import { useAppSelector } from "../../hooks/storeHooks";
import { PickerLocale } from "antd/es/date-picker/generatePicker";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useTranslation } from "react-i18next";

export const Invoices = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  const { paid_tables, isPaidFetched } = useAppSelector(
    (state) => state.tables
  );
  const { isUsersFetched, users } = useAppSelector((state) => state.user);
  const { company } = useAppSelector((state) => state.company);

  const [selectedUser, setSelectedUser] = useState<string | undefined>(
    undefined
  );
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);

  const filteredTables = [...paid_tables]
    .reverse()
    .filter((item) => (selectedUser ? item.user.id === selectedUser : true))
    .filter((item) =>
      selectedDate ? dayjs(item.paidAt).isSame(selectedDate, "date") : true
    );

  const columns: TableProps<ITables>["columns"] = [
    {
      title: t("Invoices.number"),
      dataIndex: "index",
      key: "index",
      render: (_: unknown, __: unknown, index: number) => index + 1,
      width: isMobile ? 60 : "10%",
    },
    {
      title: t("Invoices.user"),
      key: "username",
      render: (_, record) => {
        return record.user.username;
      },
      width: isMobile ? 100 : "10%",
    },
    {
      title: t("Invoices.table"),
      dataIndex: "tableNumber",
      key: "quantity",
      render: (_: unknown, render) => (
        <span style={{ fontWeight: "bold", marginLeft: "20px" }}>
          {render.tableNumber}
        </span>
      ),
      width: isMobile ? 100 : "10%",
    },
    {
      title: t("Invoices.details"),
      key: "details",
      render: (_, record) => {
        return (
          <span>
            {record.products.map((item) => (
              <Row key={item.id}>
                {item.product.name}{" "}
                <span
                  style={{
                    fontWeight: "bold",
                    marginLeft: "4px",
                    marginRight: "4px",
                  }}
                >
                  {" "}
                  -&gt;{" "}
                </span>{" "}
                {item.quantity} x {item.product.price} Den ={" "}
                {item.product.price * item.quantity} Den
              </Row>
            ))}
            <span style={{ fontWeight: "bold" }}>
              {t("Invoices.totalPrice")} ={" "}
              {record.products.reduce(
                (sum, item) => sum + item.quantity * item.product.price,
                0
              )}{" "}
              Den
            </span>
          </span>
        );
      },
      width: "30%",
    },
    {
      title: t("Invoices.creationTime"),
      key: "time_of_creation",
      render: (_, record) => {
        return (
          <span>
            <Row>{dayjs(record.acceptedAt).format("DD/MM/YYYY")}</Row>
            <Row style={{ fontWeight: "bold" }}>
              {t("Invoices.creationTime")}:{" "}
              {new Date(record?.acceptedAt ?? "")?.toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Row>
          </span>
        );
      },
      width: isMobile ? 120 : "20%",
    },
    {
      title: t("Invoices.paymentTime"),
      key: "time_of_pay",
      render: (_, record) => {
        return (
          <span>
            <Row>{dayjs(record.paidAt).format("DD/MM/YYYY")}</Row>
            <Row style={{ fontWeight: "bold" }}>
              {t("Invoices.paymentTime")}:{" "}
              {new Date(record?.paidAt ?? "")?.toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Row>
          </span>
        );
      },
      width: isMobile ? 120 : "20%",
    },
  ];

  useEffect(() => {
    if (isPaidFetched || !company?.id) return;
    dispatch(getPaidTables(company?.id));
  }, [dispatch, isPaidFetched, company?.id]);

  useEffect(() => {
    if (isUsersFetched || !company?.id) return;
    dispatch(getUsers(company?.id));
  }, [isUsersFetched]);

  return (
    <div className="invoices-layout">
      <Row className="invoices-header" gutter={[16, 16]} align={"middle"}>
        <Col xs={24} sm={24} md={12}>
          <Typography.Title level={2} className="title">
            {t("Invoices.title")}
          </Typography.Title>
        </Col>
        <Col xs={24} sm={24} md={12}>
          <Row
            gutter={[16, 16]}
            justify={isMobile ? "start" : "end"}
            className="filters-container"
          >
            <Col xs={24} sm={12} md={12}>
              <Select
                placeholder={t("Invoices.selectUser")}
                size="large"
                style={{ width: "100%" }}
                options={users?.map((item) => ({
                  label: item.username,
                  value: item.id,
                }))}
                allowClear
                onChange={(user) => setSelectedUser(user)}
              />
            </Col>
            <Col xs={24} sm={12} md={12}>
              <DatePicker
                size="large"
                format="DD/MM/YYYY"
                placeholder={t("Invoices.selectDate")}
                allowClear
                locale={
                  {
                    lang: {
                      locale: "sq",
                      today: t("Invoices.today"),
                      now: t("Invoices.now"),
                      backToToday: t("Invoices.backToToday"),
                      ok: t("Invoices.ok"),
                      cancel: t("Invoices.cancel"),
                    },
                  } as unknown as PickerLocale
                }
                style={{ width: "100%" }}
                onChange={(date) => setSelectedDate(date)}
              />
            </Col>
          </Row>
        </Col>
      </Row>
      <Row justify="end" className="total-container">
        <div className="summary-stat">
          <span className="summary-stat__label">{t("Invoices.total")}</span>
          <span className="summary-stat__value">
            {filteredTables.reduce((item, b) => item + b.sumTotal, 0)} Den
          </span>
        </div>
      </Row>
      <Table
        columns={columns}
        rowKey={"id"}
        dataSource={filteredTables}
        pagination={false}
        className="scrollable-table"
        scroll={{ x: isMobile ? 800 : undefined }}
        locale={{ emptyText: t("Invoices.noData") }}
      />
    </div>
  );
};
