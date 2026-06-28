import {
  Avatar,
  Col,
  DatePicker,
  Row,
  Select,
  Table,
  TableProps,
  Tag,
  Typography,
} from "antd";
import "./Expenses.scss";
import { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { getUsers } from "../../features/userSlice";
import { getAllUserExpenses } from "../../features/userExpenseSlice";
import { IUserExpense, IUserExpenseType } from "../../types/user-expense";
import { useAppSelector } from "../../hooks/storeHooks";
import { PickerLocale } from "antd/es/date-picker/generatePicker";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useTranslation } from "react-i18next";

export const Expenses = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isMobile = useIsMobile();

  const { isUsersFetched, users } = useSelector(
    (state: RootState) => state.user
  );
  const { isAllExpensesFetched, allUserExpenses } = useSelector(
    (state: RootState) => state.userExpenses
  );
  const { company } = useAppSelector((state) => state.company);
  const { t } = useTranslation();

  const [selectedUser, setSelectedUser] = useState<string | undefined>(
    undefined
  );
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);

  const filteredExpenses = [...allUserExpenses]
    .reverse()
    .filter((item) => (selectedUser ? item.user.id === selectedUser : true))
    .filter((item) =>
      selectedDate ? dayjs(item.updatedAt).isSame(selectedDate, "date") : true
    );

  const totalSum = filteredExpenses.reduce((sum, expense) => {
    if (expense.type === "CASH") {
      return sum + expense.cashAmount;
    } else if (expense.type === "PRODUCT" && expense.product) {
      return sum + expense.quantity * expense.product.price;
    }
    return sum;
  }, 0);

  const columns: TableProps<IUserExpense>["columns"] = [
    {
      title: t("Expenses.number"),
      dataIndex: "index",
      key: "index",
      render: (_: unknown, __: unknown, index: number) => index + 1,
      width: isMobile ? 60 : 80,
    },
    {
      title: t("Expenses.user"),
      key: "username",
      render: (_, record) => {
        return record.user.username;
      },
      width: isMobile ? 100 : 120,
    },
    {
      title: t("Expenses.type"),
      dataIndex: "type",
      key: "type",
      render: (_: unknown, render) => (
        <span style={{ fontWeight: "bold", alignItems: "center" }}>
          {render.type === IUserExpenseType.CASH ? (
            <Row align={"middle"}>
              <img
                src={"./money-icon.svg"}
                height={isMobile ? 32 : 48}
                width={isMobile ? 32 : 48}
                alt="Cash"
              />
              <Typography.Paragraph
                style={{
                  marginLeft: "10px",
                  marginTop: "10px",
                  fontSize: isMobile ? "0.9em" : "1em",
                }}
              >
                {t("Expenses.cash")}
              </Typography.Paragraph>
            </Row>
          ) : (
            <Row align={"middle"}>
              <Avatar
                src={render.product.image}
                style={{
                  height: isMobile ? "32px" : "48px",
                  width: isMobile ? "32px" : "48px",
                }}
              />
              <Typography.Paragraph
                style={{
                  marginLeft: "10px",
                  marginTop: "10px",
                  fontSize: isMobile ? "0.9em" : "1em",
                }}
              >
                {render.quantity + " x " + render?.product?.name}
              </Typography.Paragraph>
            </Row>
          )}
        </span>
      ),
    },
    {
      title: t("Expenses.price"),
      key: "price",
      render: (_, record) => {
        return (
          <span>
            <span style={{ fontWeight: "bold" }}>
              {record.type === IUserExpenseType.CASH
                ? record.cashAmount
                : record.quantity * record.product.price}{" "}
              Den
            </span>
          </span>
        );
      },
      width: isMobile ? 100 : 120,
    },
    {
      title: t("Expenses.reason"),
      key: "description",
      render: (_, record) => {
        return (
          <Tag
            bordered={false}
            className="p-20"
            style={{
              fontSize: isMobile ? "0.9em" : "1.05em",
              maxWidth: isMobile ? "150px" : "200px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {record.description ?? "/"}
          </Tag>
        );
      },
    },
    {
      title: t("Expenses.time"),
      key: "time_of_creation",
      render: (_, record) => {
        return (
          <span>
            <Row>{dayjs(record.updatedAt).format("DD/MM/YYYY")}</Row>
            <Row style={{ fontWeight: "bold" }}>
              {t("Expenses.time")}:{" "}
              {new Date(record?.updatedAt ?? "")?.toLocaleTimeString("en-GB", {
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
    if (isUsersFetched || !company?.id) return;
    dispatch(getUsers(company?.id));
  }, [isUsersFetched, company?.id]);

  useEffect(() => {
    if (isAllExpensesFetched || !company?.id) return;
    dispatch(getAllUserExpenses(company?.id));
  }, [isAllExpensesFetched, company?.id]);

  return (
    <div className="expenses-layout">
      <Row className="expenses-header" gutter={[16, 16]} align={"middle"}>
        <Col xs={24} sm={24} md={12}>
          <Typography.Title level={2} className="title">
            {t("Expenses.title")}
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
                placeholder={t("Expenses.selectUser")}
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
                placeholder={t("Expenses.selectDate")}
                allowClear
                locale={
                  {
                    lang: {
                      locale: "sq",
                      today: t("Expenses.today"),
                      now: t("Expenses.now"),
                      backToToday: t("Expenses.backToToday"),
                      ok: t("Expenses.ok"),
                      cancel: t("Expenses.cancel"),
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
          <span className="summary-stat__label">{t("Expenses.total")}</span>
          <span className="summary-stat__value">{totalSum} Den</span>
        </div>
      </Row>
      <Table
        columns={columns}
        rowKey={"id"}
        dataSource={filteredExpenses}
        pagination={false}
        className="scrollable-table"
        scroll={{ x: isMobile ? 800 : undefined }}
        locale={{ emptyText: t("Expenses.noData") }}
      />
    </div>
  );
};
