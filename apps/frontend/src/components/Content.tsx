import './Content.scss';
import { Layout } from 'antd';
import React from 'react';

export const Content = ({ children }: { children: React.JSX.Element }) => {
    return (
        <Layout.Content className="servora-content-layout">
            {children}
        </Layout.Content>
    );
};