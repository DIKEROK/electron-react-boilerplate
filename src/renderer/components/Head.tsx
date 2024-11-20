import { Box, Typography } from "@mui/joy";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../../assets/images/Logo_without_text.svg"
import { getAuth, onAuthStateChanged } from "firebase/auth";
import MenuIcon from '@mui/icons-material/Menu';
import { motion } from "framer-motion";
import SideMenu from "./SideMenu";

const TextColor = '#3C007D'

function Head() {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [currentTime, setCurrentTime] = useState('');
    const [currentDay, setCurrentDay] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setIsAuthenticated(!!user);
        });

        const updateDateTime = () => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            
            const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
            
            setCurrentTime(`${hours}:${minutes}`);
            setCurrentDay(days[now.getDay()]);
        };

        updateDateTime();
        const interval = setInterval(updateDateTime, 1000);

        return () => clearInterval(interval);
    }, []);
    
    return (
        <>
            <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
            <Box sx={{
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                flexDirection: 'row', 
                marginTop: '20px',  
                width: '100%', 
                height: '100px',
                background: 'linear-gradient(to left, rgba(50, 25, 120, 0.05), rgba(120, 0, 150, 0.05))',
                backdropFilter: "blur(10px)",
                borderRadius: '30px',
                boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.1)',
                paddingLeft: '50px',
                paddingRight: '50px',
                position: 'relative'
            }}>
                <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexDirection: 'row', flex: 1}}>
                    {isAuthenticated && (
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ duration: 0.2, ease: "easeInOut", type: "spring" }}
                        >
                            <MenuIcon
                                sx={{
                                color: TextColor, 
                                cursor: 'pointer', 
                                marginRight: '20px',
                                '&:hover': {
                                    transform: 'scale(1.1)',
                                    transition: 'transform 0.2s'
                                }
                            }} 
                                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                            />
                        </motion.div>
                    )}
                    <img src={logo} alt="logo" style={{width: '30px', height: '30px', marginRight: '-3px'}} />
                    <Typography 
                        level="h2" 
                        onClick={() => navigate('/')} 
                        sx={{
                            fontFamily: "Jockey One", 
                            letterSpacing: '2px', 
                            fontSize: '34px', 
                            color: TextColor, 
                            cursor:'pointer'
                        }}
                    >
                        STUDYTALK
                    </Typography>
                </Box>
                <Box sx={{
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Typography level="h2" sx={{fontFamily: "Montserrat", fontSize: '24px', color: TextColor}}>{currentTime}</Typography>
                    <Typography level="h2" sx={{fontFamily: "Montserrat", fontSize: '24px', color: TextColor}}>{currentDay}</Typography>
                </Box>
                <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flexDirection: 'row', flex: 1}}>
                    <Typography level="h2" onClick={() => window.close()} sx={{fontFamily: "Montserrat", fontSize: '24px', color: TextColor, cursor: 'pointer'}}>Выход</Typography>
                </Box>
            </Box>
        </>
    );
}

export default Head;
