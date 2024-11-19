import { Button } from '@mui/joy';
import { getAuth, signOut } from "firebase/auth";
import { app } from '../firebase';

function Home() {
    const auth = getAuth(app);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            console.log('Успешный выход из системы');
        } catch (error: any) {
            console.error('Ошибка при выходе:', error.message);
        }
    };

    return (
        <div>
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
        </div>
    );
}

export default Home;
