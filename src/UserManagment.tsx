import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Select } from 'antd';
import { collection, doc, getDocs, deleteDoc, updateDoc, addDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from './firebaseConfig';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const { confirm } = Modal;
const { Option } = Select;

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [visible, setVisible] = useState(false);
    const [form] = Form.useForm();
    const [editUserId, setEditUserId] = useState<string>("");
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(usersData);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const showDeleteConfirm = (userId: string) => {
        confirm({
            title: 'Are you sure delete this user?',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                deleteUser(userId);
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    };

    const deleteUser = async (userId: string) => {
        try {
            await deleteDoc(doc(db, 'users', userId));
            message.success('User deleted successfully');
            setUsers(users.filter(user => user.id !== userId));
        } catch (error) {
            console.error('Error deleting user:', error);
            message.error('Failed to delete user');
        }
    };

    const handleAddUser = () => {
        form.resetFields();
        setIsEditMode(false);
        setVisible(true);
    };

    const handleEditUser = (userId: string) => {
        const userToEdit = users.find(user => user.id === userId);
        if (userToEdit) {
            form.setFieldsValue({
                name: userToEdit.name,
                email: userToEdit.email,
                phoneNumber: userToEdit.phoneNumber,
                role: userToEdit.role.toString(),
            });
            setEditUserId(userId);
            setIsEditMode(true);
            setVisible(true);
        }
    };

    const handleEditCancel = () => {
        form.resetFields();
        setEditUserId("");
        setVisible(false);
    };

    const handleFormSubmit = async (values: any) => {
        try {
            if (isEditMode) {
                await handleEditSubmit(values);
            } else {
                await handleAddSubmit(values);
            }
        } catch (error) {
            console.error('Failed to submit form:', error);
            message.error('Failed to submit form');
        }
    };

    const handleEditSubmit = async (values: any) => {
        try {
            const { name, email, phoneNumber, role } = values;
            await updateDoc(doc(db, 'users', editUserId), {
                name,
                email,
                phoneNumber,
                role: Number(role),
            });

            message.success('User updated successfully');
            form.resetFields();
            setEditUserId("");
            setVisible(false);
            fetchUsers();
        } catch (error) {
            console.error('Failed to update user:', error);
            message.error('Failed to update user');
        }
    };

    const handleAddSubmit = async (values: any) => {
        try {
            const { email, password, name, phoneNumber, role } = values;
            const authUser = await createUserWithEmailAndPassword(auth, email, password);

            await addDoc(collection(db, 'users'), {
                name,
                email,
                phoneNumber,
                role: Number(role),
                password
            });

            message.success('User added successfully');
            form.resetFields();
            setVisible(false);
            fetchUsers();
        } catch (error) {
            console.error('Failed to add user:', error);
            message.error('Failed to add user');
        }
    };

    const columns = [
        {
            title: 'Username',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Phone Number',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role: number) => {
                switch (role) {
                    case 0:
                        return 'Pending';
                    case 1:
                        return 'User';
                    case 2:
                        return 'Blocked';
                    case 3:
                        return 'Admin';
                    default:
                        return 'Unknown';
                }
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (text: any, record: any) => (
                <div className="button-container">
                    <Button type="default" icon={<EditOutlined />} onClick={() => handleEditUser(record.id)}>Edit</Button>
                    <Button type="default" danger icon={<DeleteOutlined />} onClick={() => showDeleteConfirm(record.id)}>Delete</Button>
                </div>
            ),
        },
    ];

    return (
        <>
            <div style={{
                height: '60px',
                backgroundColor: '#f8f9fa',
                display: 'flex',
                alignItems: 'center',
                paddingLeft: '10px',
                paddingRight: '25px',
                justifyContent: 'space-between'
            }}>
            <Button type="primary" icon={<PlusOutlined/>} onClick={handleAddUser}>Add User</Button>
            </div>
            <div className="table-container">
            <Table columns={columns} dataSource={users} rowKey="id" />
            </div>

            <Modal
                title={isEditMode ? "Edit User" : "Add User"}
                visible={visible}
                onOk={form.submit}
                onCancel={handleEditCancel}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFormSubmit}
                >
                    <Form.Item
                        name="name"
                        label="Name"
                        rules={[{ required: true, message: 'Please input the name!' }]}
                    >
                        <Input type="name" />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[{ required: true, message: 'Please input the email!' }]}
                    >
                        <Input type="email" />
                    </Form.Item>
                    {!isEditMode && (
                        <Form.Item
                            name="password"
                            label="Password"
                            rules={[{ required: true, message: 'Please input the password!' }]}
                        >
                            <Input type="password" />
                        </Form.Item>
                    )}
                    <Form.Item
                        name="phoneNumber"
                        label="Phone Number"
                        rules={[{ required: true, message: 'Please input the phone number!' }]}
                    >
                        <Input type="phoneNumber" />
                    </Form.Item>
                    <Form.Item
                        name="role"
                        label="Role"
                        rules={[{ required: true, message: 'Please select the role!' }]}
                    >
                        <Select>
                            <Option value="0">Not Active</Option>
                            <Option value="1">User</Option>
                            <Option value="2">Blocked</Option>
                            <Option value="3">Admin</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default UserManagement;
