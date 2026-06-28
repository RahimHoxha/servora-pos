import {
  DeleteOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  Popconfirm,
  Row,
  Table,
  TableProps,
  Tag,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import {
  deleteRegistration,
  finishRegistration,
  getRegistrations,
} from "../../features/registrationSlice";
import "./Registration.scss";
import { IRegistration } from "../../types/registration";
import dayjs from "dayjs";
import { refetchStocks } from "../../features/stockSlice";
import { CreateRegistrationModal } from "./CreateRegistrationModal";
import { useAppSelector } from "../../hooks/storeHooks";
import { setResetExpenses } from "../../features/userExpenseSlice";
import { setResetInvoices } from "../../features/tablesSlice";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useTranslation } from "react-i18next";

export const Registration = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isRegistrationFetched, registrations } = useSelector(
    (state: RootState) => state.registrations
  );
  const { company } = useAppSelector((state) => state.company);
  const { t } = useTranslation();

  const [showCreateRegistrationModal, setShowCreateRegistrationModal] =
    useState(false);
  const isMobile = useIsMobile();

  const columns: TableProps<IRegistration>["columns"] = [
    {
      title: t("Registration.number"),
      dataIndex: "index",
      key: "index",
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    {
      title: t("Registration.viewInvoice"),
      key: "check_invoices",
      render: (_: unknown, render) => {
        // Check if we're in Electron environment
        const isElectron =
          window.navigator.userAgent.toLowerCase().indexOf("electron") > -1;

        let reportUrl = `http://localhost:3001/reports/${render.filePath}`;

        // If in Electron, try to use the resources path
        if (isElectron && (window as any).electron) {
          try {
            const resourcesPath = (window as any).electron.getResourcesPath();
            if (resourcesPath) {
              // Try multiple possible paths for the reports
              const possiblePaths = [
                // Path based on extraResources configuration
                `file://${resourcesPath}/backend/reports/${render.filePath}`,
                // Alternative path if reports are directly in resources
                `file://${resourcesPath}/reports/${render.filePath}`,
                // Another possible path
                `file://${resourcesPath}/backend/report/reports/${render.filePath}`,
              ];

              // Use the first path for now, but you can implement a check to see which one exists
              reportUrl = possiblePaths[0];
            } else {
              console.warn(
                "Resources path is undefined, falling back to localhost URL"
              );
            }
          } catch (error) {
            console.error("Error getting resources path:", error);
          }
        }

        return (
          <Button
            block
            type="primary"
            onClick={() => window.open(reportUrl, "_blank")}
          >
            {t("Registration.pdf")}
          </Button>
        );
      },
    },
    {
      title: t("Registration.name"),
      dataIndex: "reportName",
      key: "username",
    },
    {
      title: t("Registration.profitFromSales"),
      dataIndex: "invoicesTotalPrice",
      key: "invoicesTotalPrice",
      render: (_: unknown, render) => (
        <span
          style={{
            fontSize: "1.15em",
            fontWeight: "bold",
            color: render.invoicesTotalPrice >= 0 ? "#5b8c00" : "#f5222d",
          }}
        >
          {render.invoicesTotalPrice > 0 ? "+" : ""}
          {render.invoicesTotalPrice} Den
        </span>
      ),
    },
    {
      title: t("Registration.workerExpenses"),
      key: "expensesTotalPrice",
      render: (_: unknown, render) => (
        <span
          style={{ fontSize: "1.15em", fontWeight: "bold", color: "#f5222d" }}
        >
          {"-" + render.expensesTotalPrice} Den
        </span>
      ),
    },
    {
      title: t("Registration.profitLossFromCounting"),
      key: "productDifferencesTotalPrice",
      render: (_: unknown, render) => (
        <span
          style={{
            fontSize: "1.15em",
            fontWeight: "bold",
            color:
              render.productDifferencesTotalPrice >= 0 ? "#5b8c00" : "#f5222d",
          }}
        >
          {render.productDifferencesTotalPrice} Den
        </span>
      ),
    },
    {
      title: t("Registration.totalProfit"),
      key: "allEarnings",
      render: (_: unknown, render) => {
        const registrationEarnings =
          render.invoicesTotalPrice -
          render.expensesTotalPrice +
          render.productDifferencesTotalPrice;

        return (
          <span
            style={{
              fontSize: isMobile ? "1em" : "1.3em",
              fontWeight: "bold",
              color: registrationEarnings >= 0 ? "#5b8c00" : "#f5222d",
            }}
          >
            {registrationEarnings > 0 ? "+" : ""}
            {registrationEarnings} Den
          </span>
        );
      },
    },
    {
      title: (
        <Row justify={"center"}>{t("Registration.finishRegistration")}</Row>
      ),
      key: "actions",
      render: (_, render) => {
        return (
          <Row justify={"center"}>
            {!render.isFinished ? (
              <Popconfirm
                cancelText={t("Registration.confirmFinishCancel")}
                okText={t("Registration.confirmFinishOk")}
                title={t("Registration.confirmFinishTitle")}
                description={t("Registration.confirmFinishDesc")}
                icon={<QuestionCircleOutlined style={{ color: "green" }} />}
                onConfirm={() => {
                  if (!render?.id || !company?.id) return;

                  dispatch(
                    finishRegistration({
                      reportId: render.id,
                      companyId: company?.id,
                    })
                  )
                    .unwrap()
                    .then(() => {
                      dispatch(refetchStocks());
                      dispatch(setResetExpenses());
                      dispatch(setResetInvoices());
                    })
                    .catch(() => {});
                }}
              >
                <Button type="default" size="large">
                  {t("Registration.finishRegistration")}
                </Button>
              </Popconfirm>
            ) : (
              <Tag color="green" style={{ transform: "scale(1.3)" }}>
                {t("Registration.finished")}
              </Tag>
            )}
          </Row>
        );
      },
    },
    {
      title: <Row justify={"end"}>{t("Registration.deleteRegistration")}</Row>,
      key: "actions",
      render: (_, render) => {
        return (
          <Row justify="center" align="middle">
            <Popconfirm
              cancelText={t("Registration.confirmDeleteCancel")}
              okText={t("Registration.confirmDeleteOk")}
              title={t("Registration.confirmDeleteTitle")}
              description={t("Registration.confirmDeleteDesc")}
              icon={<QuestionCircleOutlined style={{ color: "red" }} />}
              onConfirm={() => {
                if (!render?.id || !company?.id) return;
                dispatch(
                  deleteRegistration({
                    reportId: render.id,
                    companyId: company?.id,
                  })
                );
              }}
            >
              <Button
                icon={
                  <DeleteOutlined key="setting" style={{ marginLeft: "2px" }} />
                }
                type="default"
                danger
                size="large"
                shape="circle"
              />
            </Popconfirm>
          </Row>
        );
      },
    },
  ];

  useEffect(() => {
    if (!isRegistrationFetched && company?.id) {
      dispatch(getRegistrations(company?.id));
    }
  }, [dispatch, isRegistrationFetched, company?.id]);

  return (
    <div className="registration-layout">
      <Row justify={"space-between"} className="header-wrapper">
        <Col>
          <Typography.Title level={2} className="title">
            {t("Registration.title")}
          </Typography.Title>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowCreateRegistrationModal(true)}
            size="large"
            disabled={
              registrations.some((item) =>
                dayjs().isSame(dayjs(item.createdAt), "day")
              ) || registrations.some((item) => !item.isFinished)
            }
          >
            {t("Registration.createButton")}
          </Button>
        </Col>
      </Row>
      {showCreateRegistrationModal ? (
        <CreateRegistrationModal
          open={showCreateRegistrationModal}
          onCancel={() => setShowCreateRegistrationModal(false)}
        />
      ) : null}
      <Table
        columns={columns}
        rowKey={"id"}
        dataSource={registrations}
        pagination={false}
        className="scrollable-table"
        style={{ marginTop: "20px" }}
      />
    </div>
  );
};
