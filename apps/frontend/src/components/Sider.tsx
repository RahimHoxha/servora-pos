import "./Sider.scss";
import { useMemo } from "react";
import { Layout, Typography } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { onLogout } from "../features/loginSlice";
import { useAppDispatch, useAppSelector } from "../hooks/storeHooks";
import { setCompany } from "../features/companySlice";
import { EAuthorized } from "../types/login";
import { useTranslation } from "react-i18next";
import { PLATFORM } from "../brand/brand";
import {
  NAV_FOOTER,
  NAV_GROUPS,
  isNavGroupVisible,
  isNavRouteVisible,
} from "../navigation/appNavigation";

const SIDEBAR_WIDTH = 268;

export const Sider = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const { company } = useAppSelector((state) => state.company);
  const { authorized } = useAppSelector((state) => state.login);

  const brandLogo = company?.logo || PLATFORM.logo;
  const brandName = company?.name || PLATFORM.name;
  const activePath = location.pathname;

  const visibleGroups = useMemo(
    () => NAV_GROUPS.filter((group) => isNavGroupVisible(group, authorized)),
    [authorized]
  );

  const onNavigate = (path: string) => {
    navigate(path);
  };

  const onClickLogout = () => {
    dispatch(onLogout());
    dispatch(setCompany(undefined));
    navigate("/login");
  };

  const showSettings = authorized === EAuthorized.AUTHORIZED_WITH_EMAIL;

  return (
    <Layout.Sider
      className="servora-rail"
      collapsed={false}
      width={SIDEBAR_WIDTH}
      theme="dark"
    >
      <div className="servora-rail__inner">
        <header className="servora-rail-header">
          <div className="servora-rail-header__logo">
            <img src={brandLogo} alt={brandName} />
          </div>
          <div className="servora-rail-header__copy">
            <Typography.Text className="servora-rail-header__name">
              {brandName}
            </Typography.Text>
            {company?.name ? (
              <Typography.Text className="servora-rail-header__meta">
                {t("Common.poweredBy", { brand: PLATFORM.name })}
              </Typography.Text>
            ) : null}
          </div>
        </header>

        <nav className="servora-rail-nav" aria-label={t("Common.Navigation.main")}>
          {visibleGroups.map((group) => (
            <section key={group.id} className="servora-nav-group">
              <span className="servora-nav-group__label">
                {t(group.labelKey)}
              </span>
              <div className="servora-nav-group__items">
                {group.routes
                  .filter((route) => isNavRouteVisible(route, authorized))
                  .map((route) => {
                    const isActive = activePath === route.path;
                    return (
                      <button
                        key={route.path}
                        type="button"
                        className={
                          "servora-nav-link" + (isActive ? " is-active" : "")
                        }
                        onClick={() => onNavigate(route.path)}
                      >
                        <span className="servora-nav-link__icon">{route.icon}</span>
                        <span className="servora-nav-link__label">
                          {t(route.labelKey)}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </section>
          ))}
        </nav>

        <footer className="servora-rail-footer">
          {showSettings ? (
            <button
              type="button"
              className={
                "servora-rail-footer__setup" +
                (activePath === NAV_FOOTER.settings.path ? " is-active" : "")
              }
              onClick={() => onNavigate(NAV_FOOTER.settings.path)}
            >
              <span className="servora-rail-footer__setup-icon">
                {NAV_FOOTER.settings.icon}
              </span>
              <span>{t(NAV_FOOTER.settings.labelKey)}</span>
            </button>
          ) : null}

          <button
            type="button"
            className="servora-rail-footer__signout"
            onClick={onClickLogout}
          >
            <span className="servora-rail-footer__signout-icon">
              {NAV_FOOTER.signOut.icon}
            </span>
            <span>{t(NAV_FOOTER.signOut.labelKey)}</span>
          </button>
        </footer>
      </div>
    </Layout.Sider>
  );
};

export const SIDEBAR_WIDTH_PX = SIDEBAR_WIDTH;
