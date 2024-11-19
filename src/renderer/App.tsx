import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { MemoryRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import '@fontsource/inter';
import Login from './pages/Login';
import Home from './pages/Home';

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    
    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setIsAuthenticated(!!user);
        });

        return () => unsubscribe();
    }, []);

    if (isAuthenticated === null) {
        return <div>Загрузка...</div>;
    }

    return (
        <Router>
            <Routes>
                <Route 
                    path="/" 
                    element={isAuthenticated ? <Navigate to="/chat" /> : <Login />} 
                />
                <Route 
                    path="/chat" 
                    element={isAuthenticated ? <Home /> : <Navigate to="/" />} 
                />
            </Routes>
        </Router>
    );
}
