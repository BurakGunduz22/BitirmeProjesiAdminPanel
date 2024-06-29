import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import Login from "./Login";
import AdminPanel from './AdminPanel';
import logo from './SAFLogo.svg'; // replace 'logo.png' with your actual logo file
import { Button } from 'antd';
import { LogoutOutlined,UserOutlined } from '@ant-design/icons';
import { auth,appCheck } from './firebaseConfig';
import { signOut } from 'firebase/auth';
import { Avatar } from 'antd';

const App: React.FC = () => {
    const [user, setUser] = useState<any | null>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
        });

        return () => unsubscribe();
    }, []);

    return (
        <>
            <TopBar user={user} />
            <Router>
                <Routes>
                    <Route path="/login" element={!user ? <Login /> : <Navigate to="/admin" />} />
                    <Route path="/admin" element={user ? <AdminPanel /> : <Navigate to="/login" />} />
                    <Route path="/" element={user ? <Navigate to="/admin" /> : <Navigate to="/login" />} />
                </Routes>
            </Router>
        </>
    );
};

interface TopBarProps {
    user: any | null;
}


const TopBar: React.FC<TopBarProps> = ({ user }) => {
    const handleLogout = () => {
        signOut(auth)
            .then(() => {
                localStorage.removeItem('user');
                window.location.href = '/login';
            })
            .catch((error: any) => {
                console.error("Error signing out: ", error);
            });
    };

    return (
        <div className="top-bar">
            <img src={logo} alt="Logo" className="logo"/>
            {user && (
                <div className="user-info">
                    <Avatar icon={<UserOutlined />} />
                    <span className="user-email">{user.email}</span>
                    <Button
                        type="default"
                        danger
                        icon={<LogoutOutlined />}
                        onClick={handleLogout}
                        className="logout-button"
                    >       
                        <span className="logout-text">Logout</span>
                    </Button>
                </div>
            )}
        </div>
    );
};


export default App;
