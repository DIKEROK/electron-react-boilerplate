import { Box, Typography, Button, Input, Avatar } from "@mui/joy";
import Head from "../components/Head";
import { getAuth } from "firebase/auth";
import { useState, useEffect } from "react";
import { getFirestore } from "firebase/firestore";
import { app } from "../firebase";
import { getDoc, doc, collection, query, where, getDocs, updateDoc, onSnapshot } from "firebase/firestore";
import { motion } from "framer-motion";

const TextColor = '#3C007D';
interface UserData {
    uid?: string;
    name: string;
    surname: string;
    patronymic: string;
    photoURL?: string;
    friends: string[];
    friendRequests: string[];
    email: string;
}

function Friends() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [friends, setFriends] = useState<UserData[]>([]);
    const [friendRequests, setFriendRequests] = useState<UserData[]>([]);
    const [searchEmail, setSearchEmail] = useState('');
    const [searchResult, setSearchResult] = useState<UserData | null>(null);
    const [error, setError] = useState('');

    const auth = getAuth(app);
    const db = getFirestore(app);

    useEffect(() => {
        const fetchUserDataAndFriends = async () => {
            if (!auth.currentUser) return;
            const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
            if (userDoc.exists()) {
                const currentUserData = userDoc.data() as UserData;
                setUserData(currentUserData);
                const friendsData = await Promise.all(
                    currentUserData.friends.map(async (friendId) => {
                        const friendDoc = await getDoc(doc(db, "users", friendId));
                        return { ...friendDoc.data(), uid: friendId } as UserData;
                    })
                );
                setFriends(friendsData);
                const requestsData = await Promise.all(
                    currentUserData.friendRequests.map(async (requestId) => {
                        const requestDoc = await getDoc(doc(db, "users", requestId));
                        return { ...requestDoc.data(), uid: requestId } as UserData;
                    })
                );
                setFriendRequests(requestsData);
            }
        };
        fetchUserDataAndFriends();
    }, [auth.currentUser]);

    // Поиск пользователя по email
    const handleSearch = async () => {
        try {
            const usersRef = collection(db, "users");
            const querySnapshot = await getDocs(usersRef);
            const searchTerms = searchEmail.toLowerCase().split(' ');
            
            let foundUser = null;
            querySnapshot.forEach((doc) => {
                const userData = doc.data() as UserData;
                const fullName = `${userData.name} ${userData.surname}`.toLowerCase();
                
                if (searchTerms.every(term => fullName.includes(term))) {
                    foundUser = { ...userData, uid: doc.id };
                }
            });

            if (foundUser) {
                setSearchResult(foundUser);
                setError('');
            } else {
                setSearchResult(null);
                setError('Пользователь не найден');
            }
        } catch (error) {
            console.error("Ошибка при поиске:", error);
            setError('Произошла ошибка при поиске');
        }
    };

    // Отправка запроса в друзья
    const sendFriendRequest = async (targetUserId: string) => {
        if (!auth.currentUser) return;

        try {
            const targetUserRef = doc(db, "users", targetUserId);
            const targetUserDoc = await getDoc(targetUserRef);
            
            if (!targetUserDoc.exists()) {
                setError('Пользователь не найден');
                return;
            }
            
            const targetUserData = targetUserDoc.data() as UserData;
            
            // Проверяем инициализацию массивов
            if (!targetUserData.friendRequests) {
                targetUserData.friendRequests = [];
            }
            
            // Проверяем, не отправлен ли уже запрос
            if (targetUserData.friendRequests.includes(auth.currentUser.uid)) {
                setError('Запрос уже отправлен');
                return;
            }

            // Проверяем, не являются ли пользователи уже друзьями
            if (targetUserData.friends && targetUserData.friends.includes(auth.currentUser.uid)) {
                setError('Этот пользователь уже в списке друзей');
                return;
            }

            await updateDoc(targetUserRef, {
                friendRequests: [...targetUserData.friendRequests, auth.currentUser.uid]
            });

            setSearchResult(null);
            setSearchEmail('');
            setError('Запрос отправлен');
        } catch (error) {
            console.error("Ошибка при отправке запроса:", error);
            setError('Ошибка при отправке запроса');
        }
    };

    // Принятие запроса в друзья
    const acceptFriendRequest = async (requesterId: string) => {
        if (!auth.currentUser || !userData) return;

        try {
            // Обновление данных текущего пользователя
            const currentUserRef = doc(db, "users", auth.currentUser.uid);
            await updateDoc(currentUserRef, {
                friends: [...userData.friends, requesterId],
                friendRequests: userData.friendRequests.filter(id => id !== requesterId)
            });

            // Обновление данных отправителя запроса
            const requesterRef = doc(db, "users", requesterId);
            const requesterDoc = await getDoc(requesterRef);
            const requesterData = requesterDoc.data() as UserData;
            await updateDoc(requesterRef, {
                friends: [...requesterData.friends, auth.currentUser.uid]
            });

            // Обновление локального состояния
            const updatedRequests = friendRequests.filter(request => request.uid !== requesterId);
            setFriendRequests(updatedRequests);
            const requesterWithId = { ...requesterData, uid: requesterId };
            setFriends([...friends, requesterWithId]);
        } catch (error) {
            console.error("Ошибка при принятии запроса:", error);
        }
    };

    return (
        <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} transition={{duration: 0.6}}>
            <Box>
                <Box sx={{display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '50px'}}>
                    <Head />
                </Box>
                <Box sx={{padding: '20px'}}>
                    <Typography level="h2" sx={{fontFamily: 'Montserrat', color: TextColor, marginBottom: '20px'}}>
                        Поиск друзей
                    </Typography>
                    <Box sx={{display: 'flex', gap: 2, marginBottom: '30px'}}>
                        <Input
                            value={searchEmail}
                            onChange={(e) => setSearchEmail(e.target.value)}
                            placeholder="Введите имя и фамилию"
                            sx={{width: '300px'}}
                        />
                        <Button onClick={handleSearch}>Найти</Button>
                    </Box>

                    {error && (
                        <Typography color="danger" sx={{marginBottom: '20px'}}>
                            {error}
                        </Typography>
                    )}

                    {searchResult && (
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            padding: '10px',
                            borderRadius: '10px',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            marginBottom: '30px'
                        }}>
                            <Avatar src={searchResult.photoURL} />
                            <Typography>
                                {`${searchResult.name} ${searchResult.surname}`}
                            </Typography>
                            <Button onClick={() => sendFriendRequest(searchResult.uid!)}>
                                Добавить в друзья
                            </Button>
                        </Box>
                    )}

                    <Typography level="h3" sx={{fontFamily: 'Montserrat', color: TextColor, marginBottom: '20px'}}>
                        Запросы в друзья ({friendRequests.length})
                    </Typography>
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, marginBottom: '30px'}}>
                        {friendRequests.map((request) => (
                            <Box key={request.email} sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                padding: '10px',
                                borderRadius: '10px',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)'
                            }}>
                                <Avatar src={request.photoURL} />
                                <Typography>
                                    {`${request.name} ${request.surname}`}
                                </Typography>
                                <Button onClick={() => acceptFriendRequest(request.uid!)}>
                                    Принять
                                </Button>
                            </Box>
                        ))}
                    </Box>

                    <Typography level="h3" sx={{fontFamily: 'Montserrat', color: TextColor, marginBottom: '20px'}}>
                        Мои друзья ({friends.length})
                    </Typography>
                    <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 2}}>
                        {friends.map((friend) => (
                            <Box key={friend.email} sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                padding: '10px',
                                borderRadius: '10px',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)'
                            }}>
                                <Avatar src={friend.photoURL} />
                                <Typography>
                                    {`${friend.name} ${friend.surname}`}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>
        </motion.div>
    );
}

export default Friends;
