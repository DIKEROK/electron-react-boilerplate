import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { MemoryRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import './App.css';
import '@fontsource/inter';
import Login from './pages/Login';
import Home from './pages/Home';
import Regestration from './pages/Regestration';
import About from './pages/About';
import Background from './components/Background';
import News from './pages/News';
import Profile from './pages/Profile';
import Friends from './pages/Friends';
import FriendProfile from './pages/FriendProfile';
import ChatList from './pages/ChatList';


function AppRoutes() {
    const location = useLocation();
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
        <AnimatePresence mode='wait'>
            <Routes location={location} key={location.pathname}>
                <Route 
                    path="/" 
                    element={isAuthenticated ? <Navigate to="/news" /> : <Login />} 
                />
                <Route 
                    path="/news"
                    element={isAuthenticated ? <News /> : <Navigate to="/" />}
                />
                <Route 
                    path="/registration" 
                    element={<Regestration />}
                />
                <Route 
                    path="/about"
                    element={<About />}
                />
                <Route 
                    path="/profile"
                    element={<Profile />}
                />
                <Route 
                    path="/friends"
                    element={<Friends />}
                />
                <Route 
                    path="/chatlist"
                    element={<ChatList />}
                />
                <Route 
                    path="/friend/:friendId"
                    element={<FriendProfile />}
                />
            </Routes>
        </AnimatePresence>
    );
}

export default function App() {
    return (
        <Router>
            <Background />
            <AppRoutes />
        </Router>
    );
}
