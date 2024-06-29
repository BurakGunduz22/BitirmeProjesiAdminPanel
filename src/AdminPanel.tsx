import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import {
    UserOutlined,
    ShopOutlined,
    AppstoreOutlined,
    TeamOutlined,
    ShoppingOutlined,
    TagsOutlined,
    FileTextOutlined,
    ReconciliationOutlined,
} from '@ant-design/icons';
import UserManagement from './UserManagment';
import ItemManagement from './ItemManagment';
import CategoryManagement from './CategoryManagement'; // Import the CategoryManagement component
import { useMediaQuery } from 'react-responsive';
import ReportsRequestsManagement from './ReportsRequestsManagement';

const { Sider, Content } = Layout;
const { SubMenu } = Menu;

const AdminPanel: React.FC = () => {
    const [selectedSection, setSelectedSection] = useState('users');
    const [openKeys, setOpenKeys] = useState(['sub1']);

    const handleSectionChange = (section: string) => {
        setSelectedSection(section);
    };

    const onOpenChange = (keys: string[]) => {
        const latestOpenKey = keys.find((key) => !openKeys.includes(key));
        if (latestOpenKey) {
            setOpenKeys([latestOpenKey]);
        } else {
            setOpenKeys([]);
        }
    };

    const renderContent = () => {
        switch (selectedSection) {
            case 'users':
                return <UserManagement />;
            case 'items':
                return <ItemManagement />;
            case 'categories':
                return <CategoryManagement />;
            case 'reports':
                return <ReportsRequestsManagement />;
            default:
                return null;
        }
    };

    // Detect screen size
    const isMobile = useMediaQuery({ maxWidth: 767 });

    return (
        <Layout>
            <Sider width={isMobile ? 80 : 200} className="site-layout-background">
                <Menu
                    mode="inline"
                    openKeys={openKeys}
                    onOpenChange={onOpenChange}
                    defaultSelectedKeys={['1']}
                    style={{ height: '100%', borderRight: 0 }}
                >
                    <SubMenu key="sub1" icon={<UserOutlined />} title="User Management">
                        <Menu.Item
                            key="1"
                            icon={<TeamOutlined />}
                            onClick={() => handleSectionChange('users')}
                        >
                            List Users
                        </Menu.Item>
                    </SubMenu>
                    <SubMenu key="sub2" icon={<ShopOutlined />} title="Items">
                        <Menu.Item
                            key="2"
                            icon={<ShoppingOutlined />}
                            onClick={() => handleSectionChange('items')}
                        >
                            List Items
                        </Menu.Item>
                    </SubMenu>
                    <SubMenu key="sub3" icon={<AppstoreOutlined />} title="Categories">
                        <Menu.Item
                            key="3"
                            icon={<TagsOutlined />}
                            onClick={() => handleSectionChange('categories')}
                        >
                            List Categories
                        </Menu.Item>
                    </SubMenu>
                    <SubMenu
                        key="sub4"
                        icon={<ReconciliationOutlined />}
                        title="Reports and Requests"
                    >
                        <Menu.Item
                            key="4"
                            icon={<FileTextOutlined />}
                            onClick={() => handleSectionChange('reports')}
                        >
                            List Reports
                        </Menu.Item>
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
