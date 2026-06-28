import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "../components/Layout";
import { Tables } from "../views/Tables/Tables";
import { Users } from "../views/Users/Users";
import { Products } from "../views/Products/Products";
import { Stock } from "../views/Stock/Stock";
import { Invoices } from "../views/Invoices/Invoices";
import { UserExpenses } from "../views/UserExpenses/UserExpenses";
import { Expenses } from "../views/Expenses/Expenses";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { Registration } from "../views/Registration/Registration";
import { EAuthorized } from "../types/login";
import { Settings } from "../views/Settings/Settings";

export const AuthorizedRoutes = () => {
  const { authorized } = useSelector((state: RootState) => state.login);

  return (
    <Layout>
      <Routes>
        <Route path="/tables" element={<Tables />} />
        {authorized === EAuthorized.AUTHORIZED_WITH_CODE ? (
          <Route path="/user-expenses" element={<UserExpenses />} />
        ) : null}
        {authorized === EAuthorized.AUTHORIZED_WITH_EMAIL ? (
          <Route path="/users" element={<Users />} />
        ) : null}
        {authorized === EAuthorized.AUTHORIZED_WITH_EMAIL ? (
          <Route path="/products" element={<Products />} />
        ) : null}
        {authorized === EAuthorized.AUTHORIZED_WITH_EMAIL ? (
          <Route path="/stock" element={<Stock />} />
        ) : null}
        {authorized === EAuthorized.AUTHORIZED_WITH_EMAIL ? (
          <Route path="/invoices" element={<Invoices />} />
        ) : null}
        {authorized === EAuthorized.AUTHORIZED_WITH_EMAIL ? (
          <Route path="/expenses" element={<Expenses />} />
        ) : null}
        {authorized === EAuthorized.AUTHORIZED_WITH_EMAIL ? (
          <Route path="/registration" element={<Registration />} />
        ) : null}
        {authorized === EAuthorized.AUTHORIZED_WITH_EMAIL ? (
          <Route path="/settings" element={<Settings />} />
        ) : null}
        <Route path="*" element={<Navigate to={"/tables"} />} />
      </Routes>
    </Layout>
  );
};
