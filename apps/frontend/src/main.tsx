import { createRoot } from 'react-dom/client'
import { store } from "./store.ts";
import { Provider } from "react-redux";
import { ConfigProvider } from 'antd';
import { appTheme } from './theme/appTheme';
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom';
import "./languages/i18n.ts"

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <BrowserRouter>
      <ConfigProvider theme={appTheme}>
        <App />
      </ConfigProvider>
    </BrowserRouter>
  </Provider>
)
