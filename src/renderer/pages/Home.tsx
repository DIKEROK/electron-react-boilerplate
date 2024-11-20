import { Box, Button } from '@mui/joy';
import { getAuth, signOut } from "firebase/auth";
import { app } from '../firebase';
import { useNavigate } from 'react-router-dom';

function Home() {
    const auth = getAuth(app);
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

    return (
        <Box>
            <h1>Домашняя страница</h1>
            <Button 
                onClick={handleLogout}
                sx={{
                    fontFamily: 'Montserrat', 
                    background: 'linear-gradient(to left, #8400FF, #FF00F6)'
                }}
            >
                Выйти
            </Button>
        </Box>
    );
}

export default Home;
