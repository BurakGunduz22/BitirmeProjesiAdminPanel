import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, message, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import './Login.css';
const Login: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            // Authenticate user
            const userCredential = await signInWithEmailAndPassword(auth, values.username, values.password);
            const userUID = userCredential.user.uid;

            // Get user document from Firestore
            const userDoc = await getDoc(doc(db, 'users', userUID));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const userRole = userData.role; // Assuming role is stored in 'role' field

                // Check if user has role 3
                if (userRole === 3) {
                    navigate('/admin', { replace: true });
                } else {
                    message.error('Unauthorized access');
                }
            } else {
                message.error('User document not found');
            }
        } catch (error) {
            message.error('Failed to login');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const onFinishFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <div className="login-container">
            <Spin spinning={loading}>
                <Form
                    name="basic"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    className="login-form"
                >
                    <Form.Item
                        label="Username"
                        name="username"
                        rules={[{ required: true, message: 'Please input your username!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[{ required: true, message: 'Please input your password!' }]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item name="remember" valuePropName="checked">
                        <Checkbox>Remember me</Checkbox>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>
                    </Form.Item>
                </Form>
            </Spin>
        </div>
    );
};

export default Login;
