import { useEffect } from "react";
import { useNavigate } from "react-router";
import { EAuthorized } from "../types/login";
import { useAppDispatch } from "./storeHooks";
import { getCompany, getCompanyByCode } from "../features/companySlice";
import { setAuthorizeState } from "../features/loginSlice";

export const useAppLoad = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const access_token = localStorage.getItem("access_token");
  const company_code = localStorage.getItem("company_code");

  useEffect(() => {
    if (access_token) {
      dispatch(getCompany())
        .unwrap()
        .then(() => {
          dispatch(setAuthorizeState(EAuthorized.AUTHORIZED_WITH_EMAIL));
        })
        .catch(() => {
          navigate("/login");
        });
    } else if (company_code) {
      dispatch(getCompanyByCode(company_code))
        .unwrap()
        .then(() => {
          dispatch(setAuthorizeState(EAuthorized.AUTHORIZED_WITH_CODE));
        })
        .catch(() => {
          navigate("/login");
        });
    } else {
      navigate("/login");
    }
  }, [dispatch, access_token, company_code]);
};
