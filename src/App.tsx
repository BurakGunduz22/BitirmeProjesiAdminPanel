import React from 'react';
import {BrowserRouter as Router, Route, Routes, Navigate} from 'react-router-dom';
import './App.css';
import Login from "./Login";
import AdminPanel from './AdminPanel';

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login/>}/>
                <Route path="/admin" element={<AdminPanel/>}/>
                <Route path="/" element={<Navigate to="/login"/>}/>
            </Routes>
        </Router>
    );
};

export default App;
