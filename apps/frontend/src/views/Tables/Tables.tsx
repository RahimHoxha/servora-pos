import { Badge, Button, Card, Col, Empty, message, Popconfirm, Row, Typography } from "antd";
import "./Tables.scss";
import CheckoutSidebar from "./CheckoutSidebar";
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import {
  getInProgressTables,
  moveOrderToTable,
  setInProgressTables,
  setSelectedTable,
} from "../../features/tablesSlice";
import { createTableBoxes, DEFAULT_TABLE_COUNT } from "../../hooks/createTableBoxes";
import { getProductCategories, getProducts } from "../../features/productSlice";
import { getAllStocks } from "../../features/stockSlice";
import { ITables } from "../../types/tables";
import { useAppSelector } from "../../hooks/storeHooks";
import { VerificationLock } from "../../components/VerificationLock";
import { UserVerificationModal } from "../../components/UserVerificationModal";
import { LockOutlined, CloseOutlined, PlusOutlined, MinusOutlined } from "@ant-design/icons";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useIsSmallTablet } from "../../hooks/useIsSmallTablet";
import { useTranslation } from "react-i18next";
import { EAuthorized } from "../../types/login";
import { io } from "socket.io-client";
import { addTableSlot, removeTableSlot } from "../../features/companySlice";

const takeMaxFour = (arr: ITables["products"]) =>
  arr.slice(0, Math.min(4, arr.length));
const totalAmount = (arr: ITables["products"]) =>
  arr.reduce((sum, item) => sum + item.quantity * item.product.price, 0);

export const Tables = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { in_progress_tables, isInProgressFetched } = useAppSelector(
    (state) => state.tables
  );
  const { selectedUser } = useAppSelector((state) => state.user);
  const { isProductsFetched, isProductCategoriesFetched } = useAppSelector(
    (state) => state.product
  );
  const { isStockFetched } = useAppSelector((state) => state.stock);
  const { company } = useAppSelector((state) => state.company);
  const { authorized } = useAppSelector((state) => state.login);
  const [messageApi, contextHolder] = message.useMessage();
  const { t } = useTranslation();

  const [selectedBox, setSelectedBox] = useState<number | null>(null);
  const [verificationCodeModal, setVerificationCodeModal] = useState(true);
  const [isSwappingTableNumber, setIsSwappingTableNumber] = useState<
    number | undefined
  >();
  const isMobile = useIsMobile();
  const isSmallTablet = useIsSmallTablet();

  const disabled = useMemo(() => {
    if (authorized === EAuthorized.AUTHORIZED_WITH_EMAIL) return false;
    return !selectedUser?.id;
  }, [selectedUser, authorized]);

  const disabledStyle = (index: number): React.CSSProperties => {
    if (isSwappingTableNumber === index + 1) {
      return {
        pointerEvents: "none",
        opacity: 0.3,
      };
    }
    return {};
  };

  const tableCount = company?.tableCount ?? DEFAULT_TABLE_COUNT;

  const tableBoxes = useMemo(
    () => createTableBoxes(in_progress_tables, tableCount),
    [in_progress_tables, tableCount]
  );

  const onAddTable = () => {
    if (!company?.id) return;
    dispatch(addTableSlot(company.id))
      .unwrap()
      .then(() => {
        messageApi.success(t("Tables.addTableSuccess"));
      })
      .catch(() => {
        messageApi.error(t("Tables.addTableError"));
      });
  };

  const onRemoveTable = () => {
    if (!company?.id) return;
    dispatch(removeTableSlot(company.id))
      .unwrap()
      .then(() => {
        if (selectedBox !== null && selectedBox >= tableCount - 1) {
          setSelectedBox(null);
          dispatch(setSelectedTable(undefined));
        }
        messageApi.success(t("Tables.removeTableSuccess"));
      })
      .catch(() => {
        messageApi.error(t("Tables.removeTableError"));
      });
  };

  const onSwapTables = (from: number, to: number) => {
    if (!from || !to || !company?.id) return;
    dispatch(
      moveOrderToTable({
        companyId: company?.id,
        fromTableNumber: from,
        toTableNumber: to,
      })
    )
      .unwrap()
      .then(({ data }) => {
        setIsSwappingTableNumber(undefined);
        dispatch(setSelectedTable(data));
        setSelectedBox(data.tableNumber - 1);
        messageApi.success(t("Tables.moveSuccess"));
      })
      .catch(() => {
        setIsSwappingTableNumber(undefined);
        messageApi.error(t("Tables.moveError"));
      });
  };

  const handleTableClick = (index: number) => {
    setSelectedBox(index);
    dispatch(setSelectedTable(tableBoxes[index] ?? undefined));
  };

  useEffect(() => {
    if (isInProgressFetched || !company?.id) return;
    dispatch(getInProgressTables(company?.id))
      .unwrap()
      .then((data) => {
        if (selectedBox !== null) {
          dispatch(
            setSelectedTable(
              data.data.find((item) => item.tableNumber === selectedBox + 1)
            )
          );
        }
      })
      .catch(() => {});
  }, [dispatch, isInProgressFetched]);

  useEffect(() => {
    if (selectedBox !== null) {
      dispatch(
        setSelectedTable(
          in_progress_tables.find(
            (item) => item.tableNumber === selectedBox + 1
          )
        )
      );
    }
  }, []);

  useEffect(() => {
    if (!isProductCategoriesFetched && company?.id) {
      dispatch(getProductCategories(company?.id));
    }
  }, [isProductCategoriesFetched, company?.id]);

  useEffect(() => {
    if (!isProductsFetched && company?.id) {
      dispatch(getProducts({ companyId: company?.id }));
    }
  }, [isProductsFetched]);

  useEffect(() => {
    if (!isStockFetched && company?.id) {
      dispatch(getAllStocks(company?.id));
    }
  }, [isStockFetched]);

  useEffect(() => {
    if (!company?.id) return;

    const socket = io(import.meta.env.VITE_BACKEND_BASE_URL);

    socket.emit("joinCompanyRoom", company?.id);

    socket.on("tables:update", (tables: ITables[]) => {
      dispatch(setInProgressTables(tables));
    });

    return () => {
      socket.off("tables:update", () => {
        socket.disconnect();
      });
    };
  }, [company?.id]);

  useEffect(() => {
    if (isMobile || isSmallTablet) {
      if (selectedBox !== null) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "auto";
      }
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [selectedBox, isMobile, isSmallTablet]);

  return (
    <Row className="tables-layout">
      {contextHolder}
      <Col
        span={isMobile || isSmallTablet ? 24 : 18}
        style={{ padding: "20px" }}
        className="tables-content"
      >
        <Row justify={"space-between"} align="middle">
          <Col>
            <Typography.Title level={2} className="title">
              {t("Tables.title")}
            </Typography.Title>
            {authorized === EAuthorized.AUTHORIZED_WITH_EMAIL && (
              <Typography.Text type="secondary">
                {t("Tables.tableCountLabel", { count: tableCount })}
              </Typography.Text>
            )}
          </Col>
          <Col>
            <Row gutter={8} align="middle">
              {authorized === EAuthorized.AUTHORIZED_WITH_EMAIL && (
                <>
                  <Col>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={onAddTable}
                    >
                      {t("Tables.addTable")}
                    </Button>
                  </Col>
                  <Col>
                    <Popconfirm
                      title={t("Tables.removeTableConfirmTitle")}
                      description={t("Tables.removeTableConfirmDesc", {
                        number: tableCount,
                      })}
                      okText={t("Tables.removeTableConfirmOk")}
                      cancelText={t("Tables.removeTableConfirmCancel")}
                      onConfirm={onRemoveTable}
                    >
                      <Button danger icon={<MinusOutlined />}>
                        {t("Tables.removeTable")}
                      </Button>
                    </Popconfirm>
                  </Col>
                </>
              )}
              {authorized === EAuthorized.AUTHORIZED_WITH_CODE && (
                <VerificationLock
                  noPaddingRight
                  onShowVerificationModal={(value) =>
                    setVerificationCodeModal(value)
                  }
                />
              )}
            </Row>
          </Col>
        </Row>
        <Row
          gutter={[4, 4]}
          style={{ marginTop: "20px" }}
          className="scrollable-tables"
        >
          {tableBoxes.map((item, index) => (
            <Col
              key={item?.id}
              sm={isSmallTablet ? 12 : 24}
              md={12}
              xl={6}
              xxl={6}
              className="table-card-col"
              style={{
                position: "relative",
                borderRadius: 4,
                transform: "scale(0.98)",
                cursor: isSwappingTableNumber ? "pointer" : "auto",
                ...disabledStyle(index),
                display: "flex",
                justifyContent: "center",
                marginBottom: isMobile || isSmallTablet ? "16px" : 0,
              }}
              onClick={(e) => {
                if (isSwappingTableNumber) {
                  e.stopPropagation();
                  e.preventDefault();
                  onSwapTables(isSwappingTableNumber, index + 1);
                } else {
                  handleTableClick(index);
                }
              }}
            >
              <Card
                style={{
                  background: index == selectedBox ? "#e6f4ff" : "none",
                  borderRadius: 10,
                  minHeight: 210,
                  position: "relative",
                  boxShadow: "rgba(99, 99, 99, 0.1) 0px 2px 8px 0px",
                  width: isMobile || isSmallTablet ? "90%" : "100%",
                }}
                bordered={false}
              >
                <Row justify={"space-between"}>
                  <div style={{ fontSize: 18, fontWeight: "bold" }}>
                    {index + 1 < 10 ? "0" : ""}
                    {index + 1}
                  </div>
                  <Badge
                    color={disabled ? "#f5222d" : !item ? "#30d372" : "#f6da48"}
                  />
                </Row>

                {disabled ? (
                  <Empty
                    style={{
                      marginTop: "30px",
                    }}
                    image={
                      <LockOutlined
                        style={{
                          fontSize: "62px",
                          cursor: "pointer",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setVerificationCodeModal(true);
                        }}
                      />
                    }
                    description=""
                  />
                ) : item ? (
                  <div style={{ height: "100px" }} className="ellipsis">
                    {takeMaxFour(item.products).map((item) => (
                      <div style={{ opacity: "0.5" }}>
                        {item.quantity} x {item.product.name}
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={t("Tables.free")}
                  />
                )}
                {item && !disabled ? (
                  <div
                    style={{
                      fontWeight: "bold",
                      opacity: "0.5",
                      fontSize: "1.5em",
                      textAlign: "center",
                    }}
                  >
                    {totalAmount(item.products)} Den
                  </div>
                ) : null}
              </Card>
              {/* Animated dashed border */}
              {isSwappingTableNumber !== undefined ? (
                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    borderRadius: 4,
                    pointerEvents: "none",
                    zIndex: 2,
                  }}
                >
                  <rect
                    x="0.5"
                    y="0.5"
                    width="99"
                    height="99"
                    rx="4"
                    ry="4"
                    fill="none"
                    stroke={"#91caff"} // Ant Design default grey
                    strokeWidth="1"
                    strokeDasharray="4 2"
                    strokeDashoffset="0"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      from="0"
                      to="-20"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </rect>
                </svg>
              ) : null}
            </Col>
          ))}
        </Row>
      </Col>
      {isMobile || isSmallTablet ? (
        <div
          className={`mobile-sidebar-overlay ${selectedBox !== null ? "open" : ""}`}
        >
          <div
            className="mobile-sidebar-close"
            onClick={() => setSelectedBox(null)}
          >
            <CloseOutlined />
          </div>
          <CheckoutSidebar
            selectedIndex={selectedBox ?? 0}
            disabled={disabled}
            swapTableNumber={isSwappingTableNumber}
            onOpenVerificationModal={() => setVerificationCodeModal(true)}
            onSwapTable={setIsSwappingTableNumber}
          />
        </div>
      ) : (
        <Col span={6} style={{ width: "100%" }}>
          <CheckoutSidebar
            selectedIndex={selectedBox ?? 0}
            disabled={disabled}
            swapTableNumber={isSwappingTableNumber}
            onOpenVerificationModal={() => setVerificationCodeModal(true)}
            onSwapTable={setIsSwappingTableNumber}
          />
        </Col>
      )}
      {verificationCodeModal &&
        authorized === EAuthorized.AUTHORIZED_WITH_CODE && (
          <UserVerificationModal
            open={verificationCodeModal}
            onClose={() => setVerificationCodeModal(false)}
          />
        )}
    </Row>
  );
};
