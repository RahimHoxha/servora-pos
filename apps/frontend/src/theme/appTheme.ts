import type { ThemeConfig } from "antd";

export const appTheme: ThemeConfig = {
  token: {
    colorPrimary: "#0f766e",
    colorInfo: "#0ea5e9",
    colorSuccess: "#16a34a",
    colorWarning: "#f59e0b",
    colorError: "#dc2626",
    colorBgLayout: "#eef2f6",
    colorBgContainer: "#ffffff",
    colorText: "#0f172a",
    colorTextSecondary: "#64748b",
    borderRadius: 12,
    fontFamily:
      "'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    boxShadowSecondary:
      "0 10px 30px rgba(15, 23, 42, 0.06), 0 2px 8px rgba(15, 23, 42, 0.04)",
  },
  components: {
    Layout: {
      bodyBg: "#eef2f6",
      siderBg: "#0f172a",
      headerBg: "#ffffff",
    },
    Menu: {
      darkItemBg: "#0f172a",
      darkSubMenuItemBg: "#111827",
      darkItemSelectedBg: "rgba(15, 118, 110, 0.22)",
      darkItemSelectedColor: "#5eead4",
      darkItemColor: "rgba(248, 250, 252, 0.82)",
      itemBorderRadius: 10,
    },
    Card: {
      borderRadiusLG: 16,
    },
    Drawer: {
      footerPaddingBlock: 16,
      footerPaddingInline: 24,
    },
    Button: {
      controlHeightLG: 44,
      primaryShadow: "0 8px 20px rgba(15, 118, 110, 0.22)",
    },
    Input: {
      controlHeightLG: 46,
    },
    Modal: {
      borderRadiusLG: 16,
    },
  },
};
