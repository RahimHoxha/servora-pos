import {
  List,
  Typography,
  Divider,
  Button,
  Row,
  Col,
  Empty,
  Popconfirm,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  LockOutlined,
  MinusOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  RollbackOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import {
  createTable,
  deleteTable,
  editTable,
  setSelectedTable,
} from "../../features/tablesSlice";
import { useEffect, useMemo, useState } from "react";
import { SelectProductModal } from "./SelectProductModal";
import { EOrderStatus, ITables } from "../../types/tables";
import { reservedProductQuantities } from "../../hooks/reservedProductQuantities";
import { PayModal } from "./PayModal";
import { PrintReceiptModal } from "./PrintReceiptModal";
import { useAppSelector } from "../../hooks/storeHooks";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useIsTablet } from "../../hooks/useIsTablet";
import { useIsSmallTablet } from "../../hooks/useIsSmallTablet";
import { useTranslation } from "react-i18next";
import { EAuthorized } from "../../types/login";

const CheckoutSidebar = ({
  selectedIndex,
  disabled,
  swapTableNumber,
  onOpenVerificationModal,
  onSwapTable,
}: {
  selectedIndex: number;
  disabled: boolean;
  swapTableNumber?: number;
  onOpenVerificationModal: () => void;
  onSwapTable: (tableNumber?: number) => void;
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isSmallTablet = useIsSmallTablet();
  const { t } = useTranslation();

  const { selectedUser } = useSelector((state: RootState) => state.user);
  const { company } = useAppSelector((state) => state.company);
  const { selectedTable, in_progress_tables } = useSelector(
    (state: RootState) => state.tables
  );
  const { products_stock } = useSelector((state: RootState) => state.stock);
  const { authorized } = useSelector((state: RootState) => state.login);

  const [isEditMode, setIsEditMode] = useState(false);
  const [openProductsModal, setOpenProductsModal] = useState(false);
  const [openPayModal, setOpenPayModal] = useState(false);
  const [printReceiptData, setPrintReceiptData] = useState<ITables | undefined>(
    undefined
  );

  const totalAmount = selectedTable?.products.reduce(
    (sum, item) => sum + item.quantity * item.product.price,
    0
  );

  const reservedQuantities = useMemo(
    () =>
      reservedProductQuantities(
        in_progress_tables.filter((item) => item.id !== selectedTable?.id)
      ),
    [in_progress_tables, selectedTable]
  );

  const isTableFree = !selectedTable || selectedTable.products.length === 0;

  const onUpsertTable = () => {
    if (!company?.id || !selectedUser?.id) return;
    return selectedTable?.id
      ? dispatch(
          editTable({
            body: {
              id: selectedTable?.id,
              body: {
                status: EOrderStatus.IN_PROGRESS,
                tableNumber: selectedTable?.tableNumber,
                userId: selectedTable.user.id,
                products: selectedTable.products.map((item) => ({
                  productId: item.product.id,
                  quantity: item.quantity,
                })),
              },
            },
            companyId: company?.id,
          })
        )
          .unwrap()
          .then(() => {
            setIsEditMode(false);
          })
          .catch(() => {})
      : selectedTable?.user?.id
        ? dispatch(
            createTable({
              body: {
                status: EOrderStatus.IN_PROGRESS,
                tableNumber: selectedIndex + 1,
                userId: selectedTable?.user?.id,
                products:
                  selectedTable?.products.map((item) => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                  })) || [],
              },
              companyId: company?.id,
            })
          )
            .unwrap()
            .then(() => {
              setIsEditMode(false);
            })
            .catch(() => {})
        : null;
  };

  const createOrder = () => {
    if (!selectedUser?.id) return;
    setIsEditMode(true);
    dispatch(
      setSelectedTable({
        id: undefined as unknown as string,
        acceptedAt: null,
        products: [],
        sumTotal: 0,
        user: selectedUser,
        tableNumber: selectedIndex + 1,
        status: EOrderStatus.IN_PROGRESS,
        paidAt: null,
      })
    );
    setOpenProductsModal(true);
  };

  const onDeleteTable = () => {
    if (!selectedTable?.id || !company?.id) return;
    dispatch(deleteTable({ id: selectedTable?.id, companyId: company?.id }));
  };

  useEffect(() => {
    setIsEditMode(false);
  }, [selectedIndex]);

  return (
    <div
      style={{
        width: "100%",
        position: "sticky",
        top: 0,
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100vh",
        boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
      }}
    >
      {authorized === EAuthorized.AUTHORIZED_WITH_EMAIL ? (
        <div>
          <Typography.Title level={3}>
            {t("Tables.CheckoutSidebar.table")}{" "}
            {selectedIndex + 1 < 10 ? "0" : ""}
            {selectedIndex + 1}
          </Typography.Title>
          {isTableFree && <Divider />}
          {isTableFree && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginTop: 88,
              }}
            >
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span style={{ fontSize: "1.2em" }}>
                    {t("Tables.CheckoutSidebar.freeTable")}
                  </span>
                }
                style={{ fontSize: "1.4em", margin: 0 }}
              />
            </div>
          )}
          {selectedTable?.user?.username && (
            <>
              <Typography.Text strong>
                {t("Tables.CheckoutSidebar.user")}:{" "}
                {selectedTable.user.username}
              </Typography.Text>
            </>
          )}
          {!isTableFree && <Divider />}
          {selectedTable && selectedTable.products.length > 0 && (
            <>
              {selectedTable.products.map((item) => (
                <Row justify="space-between" style={{ marginBottom: 8 }}>
                  <Col>
                    <Typography.Text>
                      {item.quantity} x {item.product.name}
                    </Typography.Text>
                  </Col>
                  <Col>
                    <Typography.Text>
                      {item.product.price * item.quantity} Den
                    </Typography.Text>
                  </Col>
                </Row>
              ))}
            </>
          )}
        </div>
      ) : (
        <div style={{ overflowY: "auto" }}>
          {authorized === EAuthorized.AUTHORIZED_WITH_CODE && !selectedTable ? (
            <>
              <Typography.Title level={3}>
                {t("Tables.CheckoutSidebar.table")}{" "}
                {selectedIndex + 1 < 10 ? "0" : ""}
                {selectedIndex + 1}
              </Typography.Title>
              <Divider />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  marginTop: 48,
                }}
              >
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <span style={{ fontSize: "1.2em" }}>
                      {t("Tables.CheckoutSidebar.freeTable")}
                    </span>
                  }
                  style={{ fontSize: "1.4em", margin: 0 }}
                />
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  size="large"
                  style={{ width: 220, marginTop: 16 }}
                  onClick={createOrder}
                >
                  {t("Tables.CheckoutSidebar.createOrder")}
                </Button>
              </div>
            </>
          ) : (
            <>
              <Row align={"middle"} justify={"space-between"}>
                <Col>
                  <Typography.Title
                    level={3}
                    style={{
                      marginTop: isMobile || isSmallTablet ? "36px" : "0",
                    }}
                  >
                    {t("Tables.CheckoutSidebar.table")}{" "}
                    {selectedIndex + 1 < 10 ? "0" : ""}
                    {selectedIndex + 1}
                  </Typography.Title>
                  {selectedTable ? (
                    <Typography.Text
                      strong
                      style={{ display: disabled ? "none" : "unset" }}
                    >
                      {t("Tables.CheckoutSidebar.user")}:{" "}
                      {selectedTable.user.username}
                    </Typography.Text>
                  ) : null}
                </Col>
                {selectedTable &&
                authorized === EAuthorized.AUTHORIZED_WITH_CODE ? (
                  <Row>
                    {isEditMode ? (
                      <Button
                        type="primary"
                        size="large"
                        shape="circle"
                        style={{ background: "#1677ff" }}
                        icon={<PlusOutlined />}
                        onClick={() => setOpenProductsModal(true)}
                      />
                    ) : null}
                    {!isEditMode ? (
                      <Button
                        type="primary"
                        size="large"
                        shape="circle"
                        style={{ background: "#f6da48" }}
                        icon={<EditOutlined />}
                        onClick={() => setIsEditMode(true)}
                      />
                    ) : null}
                    {!isEditMode ? (
                      <Button
                        type="primary"
                        size="large"
                        shape="circle"
                        style={{
                          background: swapTableNumber ? "#8c8c8c" : "#00B0FF",
                          marginLeft: "10px",
                        }}
                        icon={
                          swapTableNumber ? (
                            <RollbackOutlined />
                          ) : (
                            <SwapOutlined />
                          )
                        }
                        onClick={() => {
                          if (swapTableNumber) {
                            return onSwapTable(undefined);
                          }
                          return onSwapTable(selectedIndex + 1);
                        }}
                      />
                    ) : null}
                    <Popconfirm
                      placement="bottomLeft"
                      cancelText="Anulo"
                      okText="Fshije"
                      title="Fshije"
                      description="A jeni të sigurt?"
                      icon={<QuestionCircleOutlined style={{ color: "red" }} />}
                      onConfirm={onDeleteTable}
                    >
                      <Button
                        icon={<DeleteOutlined key="setting" />}
                        type="default"
                        size="large"
                        shape="circle"
                        style={{
                          marginLeft: "10px",
                          color: "#f5222d",
                          borderColor: "#f5222d",
                        }}
                      />
                    </Popconfirm>
                  </Row>
                ) : null}
              </Row>
              <Divider />
              {disabled ? (
                <Empty
                  style={{
                    marginTop: "50%",
                  }}
                  image={
                    <LockOutlined
                      style={{
                        fontSize: "92px",
                        cursor: "pointer",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onOpenVerificationModal();
                      }}
                    />
                  }
                  description=""
                />
              ) : null}
              {authorized === EAuthorized.AUTHORIZED_WITH_CODE &&
                selectedTable && (
                  <List
                    style={{ display: disabled ? "none" : "unset" }}
                    dataSource={selectedTable.products}
                    renderItem={(item) => (
                      <List.Item>
                        <Row
                          justify={"space-between"}
                          style={{ width: "100%" }}
                          align={"middle"}
                        >
                          <Col span={12}>
                            {" "}
                            <Typography.Text style={{ marginRight: "10px" }}>
                              {!isEditMode ? item.quantity + " x " : null}
                              {item.product.name}
                            </Typography.Text>
                          </Col>
                          {isEditMode ? (
                            <Col span={6} style={{ justifyItems: "flex-end" }}>
                              <Row
                                align={"middle"}
                                justify={"space-between"}
                                style={{ width: "100%" }}
                              >
                                {selectedTable && (
                                  <>
                                    <Button
                                      type="primary"
                                      size="small"
                                      danger
                                      icon={<MinusOutlined />}
                                      onClick={() => {
                                        if (item.quantity === 1) {
                                          return dispatch(
                                            setSelectedTable({
                                              ...selectedTable,
                                              id: selectedTable.id!,
                                              products:
                                                selectedTable.products.filter(
                                                  (prod) => item.id !== prod.id
                                                ),
                                            })
                                          );
                                        }
                                        dispatch(
                                          setSelectedTable({
                                            ...selectedTable,
                                            id: selectedTable.id!,
                                            products:
                                              selectedTable.products.map(
                                                (prod) => {
                                                  if (item.id === prod.id)
                                                    return {
                                                      ...prod,
                                                      quantity:
                                                        prod.quantity - 1,
                                                    };
                                                  return prod;
                                                }
                                              ),
                                          })
                                        );
                                      }}
                                    />
                                    <span style={{ fontSize: "1.2em" }}>
                                      {item.quantity}
                                    </span>
                                    <Button
                                      size="small"
                                      type="primary"
                                      icon={<PlusOutlined />}
                                      disabled={
                                        Number(
                                          products_stock?.find(
                                            (stock) =>
                                              stock.productId ===
                                              item.product.id
                                          )?.quantity
                                        ) -
                                          (reservedQuantities[
                                            item.product.id
                                          ] || 0) ===
                                        item?.quantity
                                      }
                                      onClick={() => {
                                        dispatch(
                                          setSelectedTable({
                                            ...selectedTable,
                                            id: selectedTable.id!,
                                            products:
                                              selectedTable.products.map(
                                                (prod) => {
                                                  if (item.id === prod.id)
                                                    return {
                                                      ...prod,
                                                      quantity:
                                                        prod.quantity + 1,
                                                    };
                                                  return prod;
                                                }
                                              ),
                                          })
                                        );
                                      }}
                                    />
                                  </>
                                )}
                              </Row>
                            </Col>
                          ) : null}
                          <Col span={6} style={{ textAlign: "end" }}>
                            <Typography.Text>
                              {item.product.price * item.quantity} Den
                            </Typography.Text>
                          </Col>
                        </Row>
                      </List.Item>
                    )}
                  />
                )}
              {isEditMode && selectedTable && selectedTable.products.length ? (
                <Button
                  block
                  color="cyan"
                  variant="solid"
                  style={{ marginTop: "20px" }}
                  size="large"
                  onClick={onUpsertTable}
                >
                  {t("Tables.CheckoutSidebar.save")}
                </Button>
              ) : null}
            </>
          )}
        </div>
      )}
      {selectedTable ? (
        <div style={{ display: disabled ? "none" : "unset" }}>
          <Divider />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom:
                (isMobile || isTablet || isSmallTablet) && isEditMode
                  ? "80px"
                  : "16px",
            }}
          >
            <Typography.Text
              strong
              style={{
                fontSize: isTablet || isSmallTablet ? "1.1em" : "1.5em",
              }}
            >
              {t("Tables.CheckoutSidebar.totalPrice")}
            </Typography.Text>
            <Typography.Text
              strong
              style={{
                fontSize: isTablet || isSmallTablet ? "1.1em" : "1.5em",
              }}
            >
              {totalAmount} Den
            </Typography.Text>
          </div>
          {!isEditMode && authorized === EAuthorized.AUTHORIZED_WITH_CODE ? (
            <Button
              type="primary"
              block
              size="large"
              style={{
                borderRadius: "24px",
                marginBottom:
                  isMobile || isTablet || isSmallTablet ? "80px" : "0",
              }}
              onClick={() => setOpenPayModal(true)}
            >
              {t("Tables.CheckoutSidebar.pay")}
            </Button>
          ) : null}
        </div>
      ) : null}
      {openProductsModal ? (
        <SelectProductModal
          open={openProductsModal}
          onClose={() => setOpenProductsModal(false)}
        />
      ) : null}
      {openPayModal ? (
        <PayModal
          open={openPayModal}
          onCancel={() => setOpenPayModal(false)}
          onPayConfirmed={setPrintReceiptData}
        />
      ) : null}
      {printReceiptData !== undefined ? (
        <PrintReceiptModal
          open={printReceiptData !== undefined}
          data={printReceiptData}
          onClose={() => setPrintReceiptData(undefined)}
        />
      ) : null}
    </div>
  );
};

export default CheckoutSidebar;
