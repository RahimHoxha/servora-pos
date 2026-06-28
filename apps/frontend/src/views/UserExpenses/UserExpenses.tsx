import {
  DeleteOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import {
  Row,
  Col,
  Button,
  List,
  Avatar,
  Divider,
  Typography,
  Popconfirm,
} from "antd";
import "./UserExpenses.scss";
import { useEffect, useState } from "react";
import { AppDispatch } from "../../store";
import { useDispatch } from "react-redux";
import {
  deleteUserExpense,
  getSingleUserExpenses,
} from "../../features/userExpenseSlice";
import dayjs from "dayjs";
import { IUserExpenseType } from "../../types/user-expense";
import { CreateUserExpense } from "./CreateUserExpense";
import { getAllStocks, refetchStocks } from "../../features/stockSlice";
import { getProducts } from "../../features/productSlice";
import { getInProgressTables } from "../../features/tablesSlice";
import { useAppSelector } from "../../hooks/storeHooks";
import { UserVerificationModal } from "../../components/UserVerificationModal";
import { VerificationLock } from "../../components/VerificationLock";
import { LockWrapper } from "../../components/LockWrapper";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useTranslation } from "react-i18next";

export const UserExpenses = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isMobile = useIsMobile();

  const { singleUserExpenses, isSingleUserExpensesFetched } = useAppSelector(
    (state) => state.userExpenses
  );
  const { selectedUser } = useAppSelector((state) => state.user);
  const { isProductsFetched } = useAppSelector((state) => state.product);
  const { isStockFetched } = useAppSelector((state) => state.stock);
  const { isInProgressFetched } = useAppSelector((state) => state.tables);
  const { company } = useAppSelector((state) => state.company);
  const { t } = useTranslation();

  const [showCreateExpenseModal, setShowCreateExpenseModal] = useState(false);
  const [verificationCodeModal, setVerificationCodeModal] = useState(true);

  const onDeleteExpense = (id: string) => {
    if (!company?.id || !id) return;
    dispatch(deleteUserExpense({ companyId: company?.id, expenseId: id }))
      .unwrap()
      .then(() => {
        dispatch(refetchStocks());
      })
      .catch(() => { });
  };

  useEffect(() => {
    if (isSingleUserExpensesFetched || !selectedUser?.id || !company?.id)
      return;
    dispatch(
      getSingleUserExpenses({
        userId: selectedUser?.id,
        date: dayjs().format("YYYY-MM-DD"),
        companyId: company?.id,
      })
    );
  }, [isSingleUserExpensesFetched, selectedUser?.id, company?.id]);

  useEffect(() => {
    if (!isProductsFetched && company) {
      dispatch(getProducts({ companyId: company?.id }));
    }
  }, [isProductsFetched]);

  useEffect(() => {
    if (!isStockFetched && company?.id) {
      dispatch(getAllStocks(company?.id));
    }
  }, [isStockFetched, company?.id]);

  useEffect(() => {
    if (isInProgressFetched || !company?.id) return;
    dispatch(getInProgressTables(company?.id));
  }, [dispatch, isInProgressFetched, company?.id]);

  return (
    <div className="user-expenses-layout">
      <Row
        className="header-section"
        gutter={[16, 16]}
        justify="space-between"
        align="middle"
      >
        <Col xs={24} sm={24} md={12}>
          <Typography.Title level={2} className="title">
            {t("UserExpenses.title")}
          </Typography.Title>
        </Col>
        <Col xs={24} sm={24} md={12}>
          <Row
            gutter={[16, 16]}
            justify={isMobile ? "start" : "end"}
            align="middle"
          >
            <Col>
              <VerificationLock
                onShowVerificationModal={(value) =>
                  setVerificationCodeModal(value)
                }
              />
            </Col>
            <Col>
              <Button
                disabled={!selectedUser?.id}
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                onClick={() => setShowCreateExpenseModal(true)}
              >
                {t("UserExpenses.addExpense")}
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>
      <Divider className="section-divider" />
      <LockWrapper
        onClick={() => setVerificationCodeModal(true)}
        iconSize={isMobile ? 48 : 76}
      >
        <List
          className="expenses-list"
          itemLayout="horizontal"
          dataSource={[...singleUserExpenses].reverse()}
          renderItem={(item) => (
            <List.Item className="expense-item">
              <List.Item.Meta
                avatar={
                  item.type === IUserExpenseType.CASH ? (
                    <img
                      src={"./money-icon.svg"}
                      height={isMobile ? 40 : 56}
                      width={isMobile ? 40 : 56}
                      style={{ marginTop: "6px" }}
                      alt="Cash"
                    />
                  ) : (
                    <Avatar
                      src={item.product.image}
                      style={{
                        height: isMobile ? "40px" : "56px",
                        width: isMobile ? "40px" : "56px",
                        marginTop: "10px",
                      }}
                    />
                  )
                }
                title={
                  <span className="expense-title">
                    {item.type === IUserExpenseType.CASH
                      ? t("UserExpenses.cash")
                      : item.quantity + " x " + item?.product?.name}
                  </span>
                }
                description={
                  <span className="expense-description">
                    {item?.description ?? "/"}
                  </span>
                }
              />
              <Row
                className="expense-actions"
                justify={isMobile ? "space-between" : "end"}
                align="middle"
                gutter={[16, 16]}
              >
                <Col>
                  <Typography.Title
                    level={isMobile ? 4 : 3}
                    className="expense-amount"
                  >
                    ={" "}
                    {item.type === IUserExpenseType.CASH
                      ? item.cashAmount + " Den"
                      : item.quantity * item.product.price + " Den"}
                  </Typography.Title>
                </Col>
                <Col>
                  <Popconfirm
                    cancelText={t("UserExpenses.confirmDeleteCancel")}
                    okText={t("UserExpenses.confirmDeleteOk")}
                    title={t("UserExpenses.confirmDeleteTitle")}
                    description={t("UserExpenses.confirmDeleteDesc")}
                    icon={<QuestionCircleOutlined style={{ color: "red" }} />}
                    onConfirm={() => onDeleteExpense(item.id)}
                  >
                    <Button
                      icon={<DeleteOutlined />}
                      type="default"
                      danger
                      size={isMobile ? "middle" : "large"}
                      shape="circle"
                    />
                  </Popconfirm>
                </Col>
              </Row>
            </List.Item>
          )}
        />
      </LockWrapper>
      <Divider className="section-divider" />

      {showCreateExpenseModal && (
        <CreateUserExpense
          open={showCreateExpenseModal}
          onClose={() => setShowCreateExpenseModal(false)}
        />
      )}
      {verificationCodeModal && (
        <UserVerificationModal
          open={verificationCodeModal}
          onClose={() => setVerificationCodeModal(false)}
        />
      )}
    </div>
  );
};
