import { Avatar, Box, Button, Typography } from "@mui/joy";
import Head from "../components/Head";
import { useEffect, useState, useRef } from "react";
import { app } from "../firebase";
import { getAuth } from "firebase/auth";
import { doc, getDoc, updateDoc, getFirestore } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface UserData {
    name: string;
    surname: string;
    patronymic: string;
    photoURL?: string;
}

function Profile() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const storage = getStorage(app);

    const getInitials = () => {
        if (userData) {
            const firstInitial = userData.name.charAt(0);
            const lastInitial = userData.surname.charAt(0);
            return `${firstInitial}${lastInitial}`.toUpperCase();
        }
        return '';
    };

    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !auth.currentUser) return;

        try {
            setUploading(true);
            
            // Создаем ссылку на место хранения в Storage
            const storageRef = ref(storage, `avatars/${auth.currentUser.uid}`);
            
            // Загружаем файл
            await uploadBytes(storageRef, file);
            
            // Получаем URL загруженного файла
            const downloadURL = await getDownloadURL(storageRef);
            
            // Обновляем документ пользователя в Firestore
            const userRef = doc(db, "users", auth.currentUser.uid);
            await updateDoc(userRef, {
                photoURL: downloadURL
            });
            
            // Обновляем локальное состояние
            setUserData(prev => prev ? {...prev, photoURL: downloadURL} : null);
            
        } catch (error) {
            console.error("Ошибка при загрузке файла:", error);
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            const user = auth.currentUser;
            if (user) {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    setUserData(userDoc.data() as UserData);
                }
            }
        };

        fetchUserData();
    }, [auth.currentUser]);

    return (
        <Box>
            <Box sx={{display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '50px'}}>
                <Head />
            </Box>
            <Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
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
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={handleFileUpload}
                    />
                    <Button
                        onClick={handleFileSelect}
                        disabled={uploading}
                        sx={{
                            fontFamily: 'Montserrat',
                            background: 'linear-gradient(to left, #8400FF, #FF00F6)',
                            borderRadius: '30px',
                        }}
                    >
                        {uploading ? 'Загрузка...' : 'Изменить фото'}
                    </Button>
                    <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px'}}>
                        <Typography level="h4">{userData?.name}</Typography>
                        <Typography level="h4">{userData?.surname}</Typography>
                        <Typography level="h4">{userData?.patronymic}</Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

export default Profile;
