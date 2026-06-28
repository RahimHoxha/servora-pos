import React from 'react';
import { Layout as ANTD_LAYOUT } from 'antd';
import { Content } from './Content';
import { Sider } from './Sider';
import BottomNavigation from './BottomNavigation';
import './Layout.scss';

export const Layout = ({ children }: { children: React.JSX.Element }) => {

  return (
    <ANTD_LAYOUT className="servora-app-shell">
      <ANTD_LAYOUT.Content>
        <ANTD_LAYOUT className="servora-app-row">
          <div className="desktop-sider">
            <Sider />
          </div>
          <Content>{children}</Content>
        </ANTD_LAYOUT>
      </ANTD_LAYOUT.Content>
      <BottomNavigation />
    </ANTD_LAYOUT>
  );
};