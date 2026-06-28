import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Input,
  Form,
  Typography,
  message,
  Segmented,
} from "antd";
import "./Login.scss";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { useNavigate } from "react-router-dom";
import { resetUserExpenses } from "../../features/userExpenseSlice";
import { loginWithCode, login } from "../../features/loginSlice";
import { useTranslation } from "react-i18next";
import "../../languages/i18n";
import * as CompanyServices from "../../services/company.service";
import {
  PLATFORM,
  cacheVenueBranding,
  readCachedVenueBranding,
} from "../../brand/brand";

type LoginMode = "code" | "admin";

export const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [loginMode, setLoginMode] = useState<LoginMode>("code");
  const [venueName, setVenueName] = useState<string | null>(null);
  const [venueLogo, setVenueLogo] = useState<string | null>(null);
  const { t } = useTranslation();

  const codeValue = Form.useWatch("code", form);

  const displayName = venueName || t("Login.platformName");
  const displayLogo = venueLogo || PLATFORM.logo;
  const isVenueBranded = Boolean(venueName);

  const loadVenueBranding = useCallback(async (code: string) => {
    try {
      const response = await CompanyServices.getCompanyByCode(code);
      setVenueName(response.data.name);
      setVenueLogo(response.data.logo || null);
      cacheVenueBranding(response.data.name, response.data.logo);
    } catch {
      const cached = readCachedVenueBranding();
      if (cached.name) {
        setVenueName(cached.name);
        setVenueLogo(cached.logo);
      }
    }
  }, []);

  useEffect(() => {
    const cached = readCachedVenueBranding();
    if (cached.name) {
      setVenueName(cached.name);
      setVenueLogo(cached.logo);
    }

    const savedCode = localStorage.getItem("company_code");
    if (savedCode?.length === 4) {
      form.setFieldValue("code", savedCode);
      void loadVenueBranding(savedCode);
    }
  }, [form, loadVenueBranding]);

  useEffect(() => {
    if (loginMode !== "code" || codeValue?.length !== 4) return;
    void loadVenueBranding(codeValue);
  }, [codeValue, loginMode, loadVenueBranding]);

  const onFinish = useCallback(() => {
    form
      .validateFields()
      .then((values) => {
        if (loginMode === "code") {
          dispatch(loginWithCode(values))
            .unwrap()
            .then(() => {
              dispatch(resetUserExpenses());
              navigate("/tables");
              messageApi.success(t("Login.successMessage"));
            })
            .catch(() => {
              messageApi.error(t("Login.errorMessageCompanyCode"));
            });
          return;
        }

        dispatch(login(values))
          .unwrap()
          .then(({ data }) => {
            cacheVenueBranding(data.company.name, data.company.logo);
            dispatch(resetUserExpenses());
            navigate("/tables");
            messageApi.success(t("Login.successMessage"));
          })
          .catch(() => {
            messageApi.error(t("Login.errorMessageEmailPassword"));
          });
      })
      .catch(() => {});
  }, [dispatch, form, loginMode, messageApi, navigate, t]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") onFinish();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onFinish]);

  const segmentedOptions = useMemo(
    () => [
      { label: t("Login.modeWorker"), value: "code" },
      { label: t("Login.modeAdmin"), value: "admin" },
    ],
    [t]
  );

  return (
    <div className="login-page">
      {contextHolder}

      <div className="login-page__hero">
        <div className="login-page__hero-overlay" />
        <div className="login-page__hero-content">
          <img
            src={displayLogo}
            alt={displayName}
            className="login-page__hero-logo"
          />
          <Typography.Title level={1} className="login-page__hero-title">
            {displayName}
          </Typography.Title>
          <Typography.Paragraph className="login-page__hero-text">
            {isVenueBranded
              ? t("Login.venueWelcome")
              : t("Login.platformTagline")}
          </Typography.Paragraph>
        </div>
      </div>

      <div className="login-page__panel">
        <div className="login-page__card">
          <div className="login-page__mobile-brand">
            <img src={displayLogo} alt={displayName} />
            <div>
              <Typography.Title level={4} className="login-page__mobile-title">
                {displayName}
              </Typography.Title>
              <Typography.Text type="secondary">
                {isVenueBranded
                  ? t("Login.venueWelcome")
                  : t("Login.platformTagline")}
              </Typography.Text>
            </div>
          </div>

          <Segmented
            block
            size="large"
            value={loginMode}
            options={segmentedOptions}
            onChange={(value) => setLoginMode(value as LoginMode)}
            className="login-page__mode-switch"
          />

          <Form form={form} layout="vertical" requiredMark={false}>
            {loginMode === "admin" ? (
              <>
                <Form.Item
                  name="email"
                  label={t("Login.placeholderEmail")}
                  rules={[{ required: true }]}
                >
                  <Input size="large" placeholder={t("Login.placeholderEmail")} />
                </Form.Item>
                <Form.Item
                  name="password"
                  label={t("Login.placeholderPassword")}
                  rules={[{ required: true }]}
                >
                  <Input.Password
                    size="large"
                    placeholder={t("Login.placeholderPassword")}
                  />
                </Form.Item>
              </>
            ) : (
              <Form.Item
                name="code"
                label={t("Login.companyCodeLabel")}
                rules={[
                  {
                    required: true,
                    len: 4,
                    message: t("Login.companyCodeLengthError"),
                  },
                  {
                    pattern: /^\d{4}$/,
                    message: t("Login.companyCodeFormatError"),
                  },
                ]}
              >
                <Input
                  size="large"
                  maxLength={4}
                  inputMode="numeric"
                  placeholder={t("Login.placeholderCompanyCode")}
                  className="login-page__code-input"
                />
              </Form.Item>
            )}

            <Button
              type="primary"
              block
              size="large"
              className="login-page__submit"
              onClick={onFinish}
            >
              {t("Login.loginButton")}
            </Button>
          </Form>
        </div>

        <div className="login-page__footer">
          <Typography.Text type="secondary">
            {t("Common.poweredBy", { brand: PLATFORM.name })}
          </Typography.Text>
        </div>
      </div>
    </div>
  );
};
