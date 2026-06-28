import type { ReactNode } from "react";
import {
  AppstoreOutlined,
  WalletOutlined,
  UnorderedListOutlined,
  InboxOutlined,
  FundOutlined,
  AccountBookOutlined,
  TeamOutlined,
  ControlOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import { EAuthorized } from "../types/login";

export type NavPermission = "ALL" | "ADMIN";

export interface NavRoute {
  path: string;
  labelKey: string;
  icon: ReactNode;
  permission: NavPermission;
  workerOnly?: boolean;
}

export interface NavGroup {
  id: string;
  labelKey: string;
  routes: NavRoute[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    id: "operations",
    labelKey: "Common.Navigation.groups.operations",
    routes: [
      {
        path: "/tables",
        labelKey: "Common.Navigation.floor",
        icon: <AppstoreOutlined />,
        permission: "ALL",
      },
      {
        path: "/user-expenses",
        labelKey: "Common.Navigation.myWallet",
        icon: <WalletOutlined />,
        permission: "ALL",
        workerOnly: true,
      },
    ],
  },
  {
    id: "catalog",
    labelKey: "Common.Navigation.groups.catalog",
    routes: [
      {
        path: "/products",
        labelKey: "Common.Navigation.menu",
        icon: <UnorderedListOutlined />,
        permission: "ADMIN",
      },
      {
        path: "/stock",
        labelKey: "Common.Navigation.inventory",
        icon: <InboxOutlined />,
        permission: "ADMIN",
      },
    ],
  },
  {
    id: "insights",
    labelKey: "Common.Navigation.groups.insights",
    routes: [
      {
        path: "/invoices",
        labelKey: "Common.Navigation.salesArchive",
        icon: <FundOutlined />,
        permission: "ADMIN",
      },
      {
        path: "/expenses",
        labelKey: "Common.Navigation.staffCosts",
        icon: <AccountBookOutlined />,
        permission: "ADMIN",
      },
    ],
  },
  {
    id: "team",
    labelKey: "Common.Navigation.groups.team",
    routes: [
      {
        path: "/users",
        labelKey: "Common.Navigation.staff",
        icon: <TeamOutlined />,
        permission: "ADMIN",
      },
    ],
  },
];

export const NAV_FOOTER = {
  settings: {
    path: "/settings",
    labelKey: "Common.Navigation.venueSetup",
    icon: <ControlOutlined />,
    permission: "ADMIN" as NavPermission,
  },
  signOut: {
    labelKey: "Common.Navigation.signOut",
    icon: <ExportOutlined />,
  },
};

export function isNavRouteVisible(
  route: NavRoute,
  authorized: EAuthorized
): boolean {
  if (route.workerOnly && authorized === EAuthorized.AUTHORIZED_WITH_EMAIL) {
    return false;
  }

  if (route.permission === "ADMIN") {
    return authorized === EAuthorized.AUTHORIZED_WITH_EMAIL;
  }

  return true;
}

export function isNavGroupVisible(
  group: NavGroup,
  authorized: EAuthorized
): boolean {
  return group.routes.some((route) => isNavRouteVisible(route, authorized));
}

export function flattenVisibleRoutes(authorized: EAuthorized): NavRoute[] {
  return NAV_GROUPS.flatMap((group) =>
    group.routes.filter((route) => isNavRouteVisible(route, authorized))
  );
}

export function flattenMobileNavItems(authorized: EAuthorized) {
  const routes = flattenVisibleRoutes(authorized);

  const items = routes.map((route) => ({
    key: route.path,
    labelKey: route.labelKey,
    icon: route.icon,
    permission: route.permission,
  }));

  if (authorized === EAuthorized.AUTHORIZED_WITH_EMAIL) {
    items.push({
      key: NAV_FOOTER.settings.path,
      labelKey: NAV_FOOTER.settings.labelKey,
      icon: NAV_FOOTER.settings.icon,
      permission: NAV_FOOTER.settings.permission,
    });
  }

  items.push({
    key: "logout",
    labelKey: NAV_FOOTER.signOut.labelKey,
    icon: NAV_FOOTER.signOut.icon,
    permission: "ALL",
  });

  return items;
}
