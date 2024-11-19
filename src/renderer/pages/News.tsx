import { Button } from '@mui/joy';
import { getAuth, signOut } from "firebase/auth";
import { app } from '../firebase';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function News() {
    const auth = getAuth(app);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error: any) {
            console.error('Ошибка при выходе:', error.message);
        }
    };

    return (
        <motion.div>
            <Button onClick={handleLogout}>
                Выйти
            </Button>
        </motion.div>
    );
}

export default News;