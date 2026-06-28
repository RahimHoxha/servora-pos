import {
  combineReducers,
  configureStore,
  PayloadAction,
  PreloadedStateShapeFromReducersMapObject,
} from "@reduxjs/toolkit";
import userReducer from "./features/userSlice";
import productReducer from "./features/productSlice";
import stockReducer from "./features/stockSlice";
import tablesReducer from "./features/tablesSlice";
import userExpensesReducer from "./features/userExpenseSlice";
import registrationReducer from "./features/registrationSlice";
import companyReducer from "./features/companySlice";
import loginReducer from "./features/loginSlice";

export const defaultReducers = {
  user: userReducer,
  product: productReducer,
  stock: stockReducer,
  tables: tablesReducer,
  userExpenses: userExpensesReducer,
  registrations: registrationReducer,
  company: companyReducer,
  login: loginReducer,
};

const appReducer = combineReducers(defaultReducers);

const rootReducer = (
  state: ReturnType<typeof appReducer> | undefined,
  action: PayloadAction
) => {
  if (action.type === "login/onLogout") {
    state = undefined;
  }
  return appReducer(state, action);
};

export const setupStore = (
  preloadedState?: PreloadedStateShapeFromReducersMapObject<RootState>
) => configureStore({ preloadedState, reducer: rootReducer });

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore["dispatch"];
