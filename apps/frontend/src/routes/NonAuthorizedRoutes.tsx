import { Route, Routes } from "react-router-dom";
import { Login } from "../views/Login/Login";

export const NonAuthorizedRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
    </Routes>
  );
};
