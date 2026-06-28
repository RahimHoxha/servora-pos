import {
  Button,
  Col,
  Dropdown,
  message,
  Popconfirm,
  Row,
  Table,
  TableProps,
  Tag,
  Typography,
} from "antd";
import "./Users.scss";
import {
  DeleteOutlined,
  EditOutlined,
  MoreOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { UpsertUserModal } from "./add-user-modal/UpsertUserModal";
import { AppDispatch, RootState } from "../../store";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteUser,
  getUsers,
  setSelectedUser,
} from "../../features/userSlice";
import { IUser } from "../../types/user";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../hooks/storeHooks";
import { EAuthorized } from "../../types/login";
import { useTranslation } from "react-i18next";

export const Users = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { authorized } = useAppSelector((state) => state.login);
  const { users, isUsersFetched, selectedUser } = useSelector(
    (state: RootState) => state.user
  );
  const { company } = useAppSelector((state) => state.company);
  const [messageApi, contextHolder] = message.useMessage();
  const { t } = useTranslation();

  const [showUpserUserModal, setShowUpserUserModal] = useState(false);

  const onDelete = (id: string) => {
    if (!company?.id) return;
    dispatch(deleteUser({ userId: id, companyId: company?.id }))
      .unwrap()
      .then(() => {
        messageApi.open({
          type: "success",
          content: t("Users.successDelete"),
        });
      });
  };

  const items = (user: IUser) => {
    return [
      {
        label: t("Users.changePassword"),
        key: "1",
        icon: <EditOutlined />,
        onClick: () => {
          dispatch(setSelectedUser(user));
          setShowUpserUserModal(true);
        },
      },
      {
        key: "2",
        label: (
          <Popconfirm
            disabled={authorized !== EAuthorized.AUTHORIZED_WITH_EMAIL}
            cancelText={t("Users.confirmDeleteCancel")}
            okText={t("Users.confirmDeleteOk")}
            title={t("Users.confirmDeleteTitle")}
            description={t("Users.confirmDeleteDesc")}
            icon={<QuestionCircleOutlined style={{ color: "red" }} />}
            onConfirm={() => {
              if (authorized !== EAuthorized.AUTHORIZED_WITH_EMAIL) return;
              onDelete(user.id);
            }}
          >
            {t("Users.deleteUser")}
          </Popconfirm>
        ),
        icon: <DeleteOutlined />,
        disabled: authorized !== EAuthorized.AUTHORIZED_WITH_EMAIL,
      },
    ];
  };

  const columns: TableProps<IUser>["columns"] = [
    {
      title: t("Users.number"),
      dataIndex: "index",
      key: "index",
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    {
      title: t("Users.name"),
      dataIndex: "username",
      key: "username",
    },
    {
      title: t("Users.type"),
      dataIndex: "type",
      key: "type",
      render: () => <Tag color="geekblue">{t("Users.worker")}</Tag>,
    },
    {
      title: t("Users.workerExpenses"),
      key: "expenses",
      render: () => (
        <Button
          color="cyan"
          variant="outlined"
          onClick={() => navigate("/expenses")}
        >
          {t("Users.goToTable")}
        </Button>
      ),
    },
    {
      title: (
        <Row style={{ width: "100%" }} justify={"center"}>
          {t("Users.options")}
        </Row>
      ),
      key: "settings",
      width: "10%",
      render: (_, record) => (
        <Row justify={"center"}>
          <Dropdown
            menu={{ items: items(record) }}
            placement="bottom"
            trigger={["click"]}
          >
            <Button>
              <MoreOutlined />
            </Button>
          </Dropdown>
        </Row>
      ),
    },
  ];

  useEffect(() => {
    if (isUsersFetched || !company?.id) return;
    dispatch(getUsers(company?.id));
  }, [isUsersFetched]);

  return (
    <div className="users-layout">
      {contextHolder}
      <Row justify={"space-between"} align={"middle"} className="header-wrapper">
        <Col >
          <Typography.Title level={2} className="title">
            {t("Users.title")}
          </Typography.Title>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowUpserUserModal(true)}
            size="large"
          >
            {t("Users.createButton")}
          </Button>
        </Col>
      </Row>
      {showUpserUserModal ? (
        <UpsertUserModal
          userId={selectedUser?.id}
          onClose={() => {
            dispatch(setSelectedUser(undefined));
            setShowUpserUserModal(false);
          }}
          open={showUpserUserModal}
        />
      ) : null}
      <Table
        columns={columns}
        rowKey={"id"}
        dataSource={users}
        pagination={false}
        className="scrollable-table"
        style={{ marginTop: "20px" }}
      />
    </div>
  );
};
