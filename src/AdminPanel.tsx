import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { UserOutlined, ShopOutlined, AppstoreOutlined } from '@ant-design/icons';
import UserManagement from './UserManagment';
import ItemManagement from './ItemManagment';
import CategoryManagement from './CategoryManagement'; // Import the CategoryManagement component

const { Sider, Content } = Layout;
const { SubMenu } = Menu;

const AdminPanel: React.FC = () => {
    const [selectedSection, setSelectedSection] = useState('users');

    const handleSectionChange = (section: string) => {
        setSelectedSection(section);
    };

    const renderContent = () => {
        switch (selectedSection) {
            case 'users':
                return <UserManagement />;
            case 'items':
                return <ItemManagement />;
            case 'categories': // Updated section name
                return <CategoryManagement />; // Render CategoryManagement component
            default:
                return null;
        }
    };

    return (
        <Layout>
            <Sider width={200} className="site-layout-background">
                <Menu
                    mode="inline"
                    defaultSelectedKeys={['1']}
                    style={{ height: '100%', borderRight: 0 }}
                >
                    <SubMenu key="sub1" icon={<UserOutlined />} title="User Management">
                        <Menu.Item key="1" onClick={() => handleSectionChange('users')}>List Users</Menu.Item>
                    </SubMenu>
                    <SubMenu key="sub2" icon={<ShopOutlined />} title="Items">
                        <Menu.Item key="2" onClick={() => handleSectionChange('items')}>List Items</Menu.Item>
                    </SubMenu>
                    <SubMenu key="sub3" icon={<AppstoreOutlined />} title="Categories"> {/* Changed icon and title */}
                        <Menu.Item key="3" onClick={() => handleSectionChange('categories')}>List Categories</Menu.Item> {/* Changed key and label */}
                    </SubMenu>
                </Menu>
            </Sider>
            <Layout style={{ padding: '0 24px 24px' }}>
                <Content
                    style={{
                        padding: 24,
                        margin: 0,
                        minHeight: 280,
                    }}
                >
                    {renderContent()}
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminPanel;

