import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../hooks/storeHooks";
import { onLogout } from "../features/loginSlice";
import "./BottomNavigation.scss";
import { NavItems, useMobileNavItems } from "./BottomNavigation.items";

const BottomNavigation = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const navItems = useMobileNavItems();

  const handleClick = (item: NavItems) => {
    if (item.isLogout) {
      dispatch(onLogout());
      navigate("/login");
    } else {
      navigate(item.key);
    }
  };

  return (
    <nav className="mobile-bottom-nav">
      <div className="mobile-bottom-nav-scroll">
        {navItems.map((item) => {
          const isActive =
            item.key !== "logout" && location.pathname === item.key;
          return (
            <div
              key={item.key}
              className={
                "mobile-bottom-nav-item" +
                (isActive ? " active" : "") +
                (item.isLogout ? " logout" : "")
              }
              onClick={() => handleClick(item)}
            >
              <span className="mobile-bottom-nav-icon">{item.icon}</span>
              <span className="mobile-bottom-nav-label">{item.label}</span>
            </div>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
