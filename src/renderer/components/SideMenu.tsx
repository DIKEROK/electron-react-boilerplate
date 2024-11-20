import { Avatar, Button, Typography } from "@mui/joy";
import { Box } from "@mui/joy";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getAuth, signOut} from "firebase/auth";
import { getFirestore, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { app } from '../firebase';
import { useNavigate } from "react-router-dom";
import PersonIcon from '@mui/icons-material/Person';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
const TextColor = '#3C007D';

interface SideMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

interface UserData {
    name: string;
    surname: string;
    photoURL?: string;
}

function SideMenu({isOpen, onClose}: SideMenuProps) {
    const [userData, setUserData] = useState<UserData | null>(null);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            console.log('Успешный выход из системы');
            navigate('/');
        } catch (error: any) {
            console.error('Ошибка при выходе:', error.message);
        }
    };

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const unsubscribe = onSnapshot(doc(db, "users", user.uid), (doc) => {
            if (doc.exists()) {
                setUserData(doc.data() as UserData);
            }
        });

        return () => unsubscribe();
    }, [auth.currentUser]);

    if (!isOpen) return null;

    const getInitials = () => {
        if (userData) {
            const firstInitial = userData.name.charAt(0);
            const lastInitial = userData.surname.charAt(0);
            return `${firstInitial}${lastInitial}`.toUpperCase();
        }
        return '';
    };

    return (
        <>
            <motion.div
                onClick={onClose}
                initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                animate={{ opacity: 1, backdropFilter: 'blur(2px)' }}
                exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.15)',
                    zIndex: 900
                }}
            />
            <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={{ x: '-100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '-100%', opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut", type: "spring" }}
                style={{
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '250px',
                    background: 'linear-gradient(to top, #FFC4EA, #F5D8FF)',
                    borderRadius: '0 20px 20px 0',
                    boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
                    zIndex: 1000,
                    display: 'flex',
                    justifyContent: 'center'
                }}
            >
                <Box sx={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2
                }}>
                    <Avatar
                        src={userData?.photoURL}
                        sx={{ 
                            width: 80, 
                            height: 80,
                            fontSize: '1.5rem',
                            background: 'linear-gradient(45deg, #959AFF, #D89EFF)'
                        }}
                    >
                        {getInitials()}
                    </Avatar>
                    <Typography 
                        level="h4" 
                        sx={{
                            fontFamily: 'Montserrat',
                            color: TextColor
                        }}
                    >
                        {userData ? `${userData.name} ${userData.surname}` : 'Загрузка...'}
                    </Typography>
                    <Box onClick={() => navigate('/profile')} sx={{display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <PersonIcon />
                        <Typography level="h4" sx={{fontFamily: 'Montserrat', color: TextColor}}>Профиль</Typography>
                    </Box>
                    <Box onClick={() => navigate('/news')} sx={{display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <ArticleRoundedIcon />
                        <Typography level="h4" sx={{fontFamily: 'Montserrat', color: TextColor}}>Новости</Typography>
                    </Box>
                    <Box onClick={() => navigate('/friends')} sx={{display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <GroupRoundedIcon />
                        <Typography level="h4" sx={{fontFamily: 'Montserrat', color: TextColor}}>Друзья</Typography>
                    </Box>
                    <Box onClick={() => navigate('/chatlist')} sx={{display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <ForumRoundedIcon />
                        <Typography level="h4" sx={{fontFamily: 'Montserrat', color: TextColor}}>Чаты</Typography>
                    </Box>
                    <Box onClick={handleLogout} sx={{display: 'flex', alignItems: 'center', cursor: 'pointer', marginTop: '450px'}}>
                        <LogoutRoundedIcon />
                        <Typography level="h4" sx={{fontFamily: 'Montserrat', color: TextColor}}>Выйти из аккаунта</Typography>
                    </Box>
                </Box>
            </motion.div>
        </>
    );
}

export default SideMenu;
