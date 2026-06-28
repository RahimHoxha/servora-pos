import { useTranslation } from "react-i18next";
import { useAppSelector } from "../hooks/storeHooks";
import { flattenMobileNavItems } from "../navigation/appNavigation";

export interface NavItems {
  key: string;
  label: string;
  icon: React.ReactNode;
  isLogout?: boolean;
  permission: string;
}

export function useMobileNavItems(): NavItems[] {
  const { t } = useTranslation();
  const { authorized } = useAppSelector((state) => state.login);

  return flattenMobileNavItems(authorized).map((item) => ({
    key: item.key,
    label: t(item.labelKey),
    icon: item.icon,
    permission: item.permission,
    isLogout: item.key === "logout",
  }));
}
