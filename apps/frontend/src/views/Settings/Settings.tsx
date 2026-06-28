import {
  Button,
  Col,
  Divider,
  Form,
  Image,
  Input,
  Row,
  Select,
  Typography,
  Upload,
} from "antd";
import "./Settings.scss";
import { UploadOutlined } from "@ant-design/icons";
import { RcFile, UploadFile } from "antd/es/upload";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/storeHooks";
import { updateCompany, uploadImage } from "../../features/companySlice";
import { useForm } from "antd/es/form/Form";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useTranslation } from "react-i18next";
import { ChangeAdminPasswordDrawer } from "./ChangeAdminPasswordDrawer";

const extractFileNameFromUrl = (url: string) => {
  const parts = url?.split("/uploads/");
  if (parts?.length === 2) {
    return parts[1].split("_").pop() || "";
  }
  return "";
};

export const Settings = () => {
  const dispatch = useAppDispatch();
  const [form] = useForm();

  const { company } = useAppSelector((state) => state.company);

  const name = Form.useWatch("name", form);
  const address = Form.useWatch("address", form);
  const phone = Form.useWatch("phone", form);

  const [image, setImage] = useState<UploadFile[]>([]);
  const [passwordDrawerOpen, setPasswordDrawerOpen] = useState(false);

  const { i18n, t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(
    i18n.language.toLowerCase()
  );

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng.toUpperCase());
    localStorage.setItem("app_language", lng.toUpperCase());
  };

  const disableButton = useMemo(() => {
    return (
      name === company?.name &&
      address === company?.address &&
      phone === company?.phone &&
      image?.[0]?.url === company?.logo
    );
  }, [name, address, phone, company, image]);

  const onImageUpload = (file: RcFile) => {
    const formData = new FormData();
    formData.append("file", file, file.name);

    setImage([
      {
        uid: "1",
        name: "Uploading...",
        status: "uploading",
      },
    ]);

    dispatch(uploadImage(formData))
      .unwrap()
      .then((res) => {
        setImage([
          {
            uid: res.data.key,
            name: extractFileNameFromUrl(res.data.key) || file.name,
            url: res.data.url,
            thumbUrl: res.data.url,
          },
        ]);
      })
      .catch(() => {
        setImage([
          {
            uid: "1",
            name: "Error while uploading",
            status: "error",
          },
        ]);
      });
    return false;
  };

  const onBadgeClick = () => {
    setImage([]);
  };

  const onSaveCompanyInfo = () => {
    if (!company?.id) return;
    dispatch(
      updateCompany({
        id: company?.id,
        body: {
          address,
          logo: image?.[0]?.url || "",
          name,
          phone,
        },
      })
    );
  };

  useEffect(() => {
    form.setFieldsValue(company);
    if (company?.logo) {
      setImage(() => [
        {
          name: extractFileNameFromUrl(company.logo),
          uid: "1",
          url: company.logo,
        },
      ]);
    }
  }, [company]);

  useEffect(() => {
    setSelectedLanguage(i18n.language.toLowerCase());
  }, [i18n.language]);

  return (
    <div className="settings-layout">
      <header className="settings-header">
        <span className="title">{t("Settings.title")}</span>
      </header>

      <Form
        layout="vertical"
        requiredMark={false}
        form={form}
        className="settings-form-panel"
      >
        <section className="settings-section">
          <Typography.Title level={5} className="settings-section-title">
            {t("Settings.logo")}
          </Typography.Title>

          <div className="settings-brand-row">
            <div className="settings-brand-upload">
              {image.length === 0 ? (
                <Upload
                  fileList={image}
                  beforeUpload={(file) => onImageUpload(file)}
                  listType="picture-card"
                  maxCount={1}
                  showUploadList={{ showRemoveIcon: true }}
                  accept="image/*"
                  onRemove={() => setImage([])}
                >
                  <UploadOutlined />
                </Upload>
              ) : (
                <div className="avatar-wrapper">
                  <div className="avatar-container">
                    <Image
                      src={image[0]?.url}
                      alt={image[0]?.name}
                      className="avatar-image"
                    />
                  </div>
                  <button
                    className="avatar-badge"
                    onClick={(e) => {
                      e.stopPropagation();
                      onBadgeClick();
                    }}
                    aria-label="Remove logo"
                    type="button"
                  >
                    X
                  </button>
                </div>
              )}
            </div>

            <Typography.Text type="secondary" className="settings-logo-hint">
              {t("Settings.logoHint")}
            </Typography.Text>
          </div>
        </section>

        <Divider className="settings-divider" />

        <section className="settings-section">
          <Row gutter={[24, 8]}>
            <Col xs={24} xl={12}>
              <Form.Item
                name={["admin_credentials", "email"]}
                label={t("Settings.email")}
              >
                <Input size="large" disabled />
              </Form.Item>
            </Col>
            <Col xs={24} xl={12}>
              <Form.Item label={t("Settings.companyCode")}>
                <Input size="large" value={company?.code} disabled />
              </Form.Item>
            </Col>
            <Col xs={24} xl={12}>
              <Form.Item name="name" label={t("Settings.name")}>
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} xl={12}>
              <Form.Item name="address" label={t("Settings.address")}>
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} xl={12}>
              <Form.Item name="phone" label={t("Settings.phone")}>
                <PhoneInput
                  country="mk"
                  buttonStyle={{
                    borderTopLeftRadius: "8px",
                    borderBottomLeftRadius: "8px",
                  }}
                  inputStyle={{
                    height: "46px",
                    background: "#ffffff",
                    borderWidth: "1px",
                    borderStyle: "solid",
                    borderColor: "#d9d9d9",
                    borderRadius: "8px",
                    width: "100%",
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <div className="settings-actions">
            <Button
              type="primary"
              size="large"
              className="ruaj-btn"
              disabled={disableButton}
              onClick={onSaveCompanyInfo}
            >
              {t("Settings.saveButton")}
            </Button>
          </div>
        </section>

        <Divider className="settings-divider" />

        <section className="settings-section settings-section--footer">
          <Row gutter={[32, 24]}>
            <Col xs={24} lg={12}>
              <div className="settings-subcard">
                <Typography.Title level={5} className="settings-section-title">
                  {t("Settings.passwordTitle")}
                </Typography.Title>
                <Button size="large" onClick={() => setPasswordDrawerOpen(true)}>
                  {t("Settings.changePasswordButton")}
                </Button>
              </div>
            </Col>
            <Col xs={24} lg={12}>
              <div className="settings-subcard">
                <Typography.Title level={5} className="settings-section-title">
                  {t("Settings.languageTitle")}
                </Typography.Title>
                <Select
                  size="large"
                  className="settings-language-select"
                  value={selectedLanguage}
                  options={[
                    { label: t("Common.Languages.en"), value: "en" },
                    { label: t("Common.Languages.al"), value: "al" },
                    { label: t("Common.Languages.mk"), value: "mk" },
                  ]}
                  onChange={handleLanguageChange}
                />
              </div>
            </Col>
          </Row>
        </section>
      </Form>

      <ChangeAdminPasswordDrawer
        open={passwordDrawerOpen}
        onClose={() => setPasswordDrawerOpen(false)}
      />
    </div>
  );
};
