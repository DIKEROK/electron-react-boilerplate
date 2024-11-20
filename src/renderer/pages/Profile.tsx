import { Avatar, Box, Button, Typography } from "@mui/joy";
import Head from "../components/Head";
import { useEffect, useState, useRef } from "react";
import { app } from "../firebase";
import { getAuth } from "firebase/auth";
import { doc, getDoc, updateDoc, getFirestore, collection, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface UserData {
    name: string;
    surname: string;
    patronymic: string;
    photoURL?: string;
    friends?: string[];
}

function Profile() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const storage = getStorage(app);
    const [friends, setFriends] = useState<UserData[]>([]);

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

    useEffect(() => {
        const fetchFriends = async () => {
            if (!userData?.friends) return;
            
            try {
                const friendsData = await Promise.all(
                    userData.friends.slice(0, 2).map(async (friendId) => {
                        const friendDoc = await getDoc(doc(db, "users", friendId));
                        return friendDoc.data() as UserData;
                    })
                );
                setFriends(friendsData);
            } catch (error) {
                console.error("Ошибка при загрузке друзей:", error);
            }
        };

        fetchFriends();
    }, [userData?.friends]);

    return (
        <Box>
            <Box sx={{display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '50px'}}>
                <Head />
            </Box>
            <Box>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                    <Avatar
                        src={userData?.photoURL}
                        sx={{ 
                            width: 180, 
                            height: 180,
                            fontSize: '1.5rem',
                            background: 'linear-gradient(45deg, #959AFF, #D89EFF)'
                        }}
                    >
                        {getInitials()}
                    </Avatar>
                    <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '10px'}}>
                        <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px'}}>
                            <Typography level="h1" sx={{fontFamily: 'Montserrat'}}>{userData?.surname}</Typography>
                            <Typography level="h1" sx={{fontFamily: 'Montserrat'}}>{userData?.name}</Typography>
                        </Box>
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
                                background: 'linear-gradient(to left, #F480FF, #B14BFF)',
                                borderRadius: '30px',
                                width: '250px',
                                height: '50px',
                            }}
                        >
                            {uploading ? 'Загрузка...' : 'Изменить фото'}
                        </Button>
                    </Box>
                </Box>
                <Box sx={{
                            marginTop: '50px',
                            width: '450px', 
                            height: '280px',
                            marginBottom: '20px',
                            position: 'relative',
                            padding: '30px',
                            boxShadow: 'none',
                            borderColor: 'rgba(0, 0, 0, 0)',
                            backgroundColor: 'transparent', 
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                borderRadius: '25px',
                                border: '2px solid transparent',
                                background: 'linear-gradient(45deg, #8400FF, #FF00F6) border-box',
                                WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                                WebkitMaskComposite: 'destination-out',
                                maskComposite: 'exclude'
                            }
                        }}
                    >
                        <Typography level="h2" sx={{fontFamily: 'Montserrat', marginBottom: '20px', fontSize: '34px'}}>Друзья</Typography>
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                            {friends.map((friend, index) => (
                                <Box key={index} sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px'}}>
                                    <Avatar 
                                        src={friend.photoURL} 
                                        sx={{
                                            width: 90, 
                                            height: 90,
                                            fontSize: '1.5rem',
                                            background: 'linear-gradient(45deg, #959AFF, #D89EFF)'
                                        }}
                                    >
                                        {friend.name?.[0]}{friend.surname?.[0]}
                                    </Avatar>
                                    <Typography level="h3" sx={{fontFamily: 'Montserrat', fontSize: '22px'}}>
                                        {friend.name} {friend.surname}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                </Box>
            </Box>
        </Box>
    );
}

export default Profile;
