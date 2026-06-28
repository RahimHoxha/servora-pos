import { useSelector } from "react-redux";
import "./App.css";
import { RootState } from "./store";
import { Row, Spin } from "antd";
import { useAppLoad } from "./hooks/useAppLoad";
import { AuthorizedRoutes } from "./routes/AuthorizedRoutes";
import { EAuthorized } from "./types/login";
import { useAppSelector } from "./hooks/storeHooks";
import { LoadingOutlined } from "@ant-design/icons";
import { NonAuthorizedRoutes } from "./routes/NonAuthorizedRoutes";

function App() {
  const { authorized } = useSelector((state: RootState) => state.login);
  const { company, loading: loadingCompany } = useAppSelector(
    (state) => state.company
  );

  useAppLoad();

  if (!loadingCompany && authorized !== EAuthorized.UNAUTHORIZED && company) {
    return <AuthorizedRoutes />;
  } else if (!loadingCompany && authorized == EAuthorized.UNAUTHORIZED) {
    return <NonAuthorizedRoutes />;
  }

  return (
    <Row
      align={"middle"}
      justify={"center"}
      style={{ width: "100vw", height: "100vh" }}
    >
      <Spin indicator={<LoadingOutlined style={{ fontSize: 72 }} spin />} />
    </Row>
  );
}

export default App;
