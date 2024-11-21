import { Box, Typography, Button, Input, Avatar } from "@mui/joy";
import Head from "../components/Head";
import { getAuth } from "firebase/auth";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, onSnapshot } from "firebase/firestore";
import { app } from "../firebase";
import { getDoc, doc, collection, getDocs, updateDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

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
    const [searchResult, setSearchResult] = useState<UserData[]>([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const auth = getAuth(app);
    const db = getFirestore(app);

    useEffect(() => {
        if (!auth.currentUser) return;

        const userRef = doc(db, "users", auth.currentUser.uid);
        const unsubscribe = onSnapshot(userRef, async (docSnapshot) => {
            if (docSnapshot.exists()) {
                const currentUserData = docSnapshot.data() as UserData;
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
        });

        return () => unsubscribe();
    }, [auth.currentUser]);

    useEffect(() => {
        const searchUsers = async () => {
            if (!searchEmail.trim() || !auth.currentUser) {
                setSearchResult([]);
                return;
            }

            try {
                const usersRef = collection(db, "users");
                const querySnapshot = await getDocs(usersRef);
                const searchTerms = searchEmail.toLowerCase().split(' ');
                
                let foundUsers: UserData[] = [];
                querySnapshot.forEach((doc) => {
                    const userData = doc.data() as UserData;
                    const fullName = `${userData.name} ${userData.surname}`.toLowerCase();
                    
                    if (doc.id === auth.currentUser!.uid) {
                        return;
                    }
                    
                    if (searchTerms.every(term => fullName.includes(term))) {
                        foundUsers.push({ ...userData, uid: doc.id });
                    }
                });

                setSearchResult(foundUsers);
            } catch (error) {
                console.error("Ошибка при поиске:", error);
            }
        };

        searchUsers();
    }, [searchEmail, db, auth.currentUser]);

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
            
            if (!targetUserData.friendRequests) {
                targetUserData.friendRequests = [];
            }
            
            if (targetUserData.friendRequests.includes(auth.currentUser.uid)) {
                setError('Запрос уже отправлен');
                return;
            }

            if (targetUserData.friends && targetUserData.friends.includes(auth.currentUser.uid)) {
                setError('Этот пользователь уже в списке друзей');
                return;
            }

            await updateDoc(targetUserRef, {
                friendRequests: [...targetUserData.friendRequests, auth.currentUser.uid]
            });

            setSearchResult([]);
            setSearchEmail('');
            setError('Запрос отправлен');
        } catch (error) {
            console.error("Ошибка при отправке запроса:", error);
            setError('Ошибка при отправке запроса');
        }
    };

    const acceptFriendRequest = async (requesterId: string) => {
        if (!auth.currentUser || !userData) return;

        try {
            const currentUserRef = doc(db, "users", auth.currentUser.uid);
            await updateDoc(currentUserRef, {
                friends: [...userData.friends, requesterId],
                friendRequests: userData.friendRequests.filter(id => id !== requesterId)
            });

            const requesterRef = doc(db, "users", requesterId);
            const requesterDoc = await getDoc(requesterRef);
            const requesterData = requesterDoc.data() as UserData;
            await updateDoc(requesterRef, {
                friends: [...requesterData.friends, auth.currentUser.uid]
            });

            const updatedRequests = friendRequests.filter(request => request.uid !== requesterId);
            setFriendRequests(updatedRequests);
            const requesterWithId = { ...requesterData, uid: requesterId };
            setFriends([...friends, requesterWithId]);
        } catch (error) {
            console.error("Ошибка при принятии запроса:", error);
        }
    };

    const rejectFriendRequest = async (requesterId: string) => {
        if (!auth.currentUser || !userData) return;

        try {
            const currentUserRef = doc(db, "users", auth.currentUser.uid);
            await updateDoc(currentUserRef, {
                friendRequests: userData.friendRequests.filter(id => id !== requesterId)
            });

            const updatedRequests = friendRequests.filter(request => request.uid !== requesterId);
            setFriendRequests(updatedRequests);
        } catch (error) {
            console.error("Ошибка при отклонении запроса:", error);
            setError('Ошибка при отклонении запроса');
        }
    };

    const removeFriend = async (friendId: string) => {
        if (!auth.currentUser || !userData) return;

        try {
            const currentUserRef = doc(db, "users", auth.currentUser.uid);
            await updateDoc(currentUserRef, {
                friends: userData.friends.filter(id => id !== friendId)
            });

            const friendRef = doc(db, "users", friendId);
            const friendDoc = await getDoc(friendRef);
            const friendData = friendDoc.data() as UserData;
            await updateDoc(friendRef, {
                friends: friendData.friends.filter(id => id !== auth.currentUser!.uid)
            });

            const updatedFriends = friends.filter(friend => friend.uid !== friendId);
            setFriends(updatedFriends);
        } catch (error) {
            console.error("Ошибка при удалении друга:", error);
            setError('Ошибка при удалении друга');
        }
    };

    return (
        <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} transition={{duration: 0.6}}>
            <Box>
                <Box sx={{display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '50px'}}>
                    <Head />
                </Box>
                <Box sx={{
                    width: '170px', 
                    height: '557px', 
                    position: 'absolute', 
                    padding: '20px', 
                    borderRadius: '20px', 
                    border: '2px solid rgba(60, 0, 165, 0.05)',
                    backgroundColor: '#F4D9FF'}}>
                        <Box sx={{
                           display: 'flex',
                           flexDirection: 'column',
                           gap: '10px',
                        }}>
                            <Typography sx={{
                                fontFamily: 'Montserrat',
                                color: 'white',
                                background: 'linear-gradient(45deg, #8400FF, #F3B7FF)',
                                padding: '10px 20px',
                                borderRadius: '30px',
                                textAlign: 'center',
                                position: 'relative',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    borderRadius: '30px',
                                    boxShadow: 'inset 2px 5px 7.7px rgba(255, 255, 255, 0.56)',
                                    width: '100%',
                                    height: '100%',
                                    pointerEvents: 'none'
                                }
                            }}>
                                Курс
                            </Typography>
                            <Box sx={{
                           display: 'flex',
                           flexDirection: 'column',
                           gap: '10px'
                        }}>
                            <Typography sx={{
                                fontFamily: 'Montserrat',
                                color: 'white',
                                background: 'linear-gradient(45deg, #8400FF, #F3B7FF)',
                                padding: '10px 20px',
                                borderRadius: '30px',
                                textAlign: 'center',
                                position: 'relative',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    borderRadius: '30px',
                                    boxShadow: 'inset 2px 5px 7.7px rgba(255, 255, 255, 0.56)',
                                    width: '100%',
                                    height: '100%',
                                    pointerEvents: 'none'
                                }
                            }}>
                                Колледж
                            </Typography>
                            <Box sx={{
                           display: 'flex',
                           flexDirection: 'column',
                           gap: '10px'
                        }}>
                            <Typography sx={{
                                fontFamily: 'Montserrat',
                                color: 'white',
                                background: 'linear-gradient(45deg, #8400FF, #F3B7FF)',
                                padding: '10px 20px',
                                borderRadius: '30px',
                                textAlign: 'center',
                                position: 'relative',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    borderRadius: '30px',
                                    boxShadow: 'inset 2px 5px 7.7px rgba(255, 255, 255, 0.56)',
                                    width: '100%',
                                    height: '100%',
                                    pointerEvents: 'none'
                                }
                            }}>
                                Специальность
                            </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>
                <Box sx={{margin: '0 auto', maxWidth: '800px', left: '25%', position: 'absolute'}}>
                    
                    
                    <Box sx={{
                        display: 'flex', 
                        gap: 2, 
                        
                        
                    }}>
                    <Input 
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                        placeholder="Поиск студентов"
                        startDecorator={<SearchRoundedIcon sx={{color: 'black'}} />}
                        slotProps={{
                            input: {
                                style: {
                                    textAlign: 'left',
                                    fontFamily: 'Montserrat'
                                }
                            }
                        }}
                        sx={{
                            width: '300px', 
                            height: '60px',
                            marginBottom: '20px',
                            position: 'relative',
                            padding: '15px 20px',
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
                                borderRadius: '20px', 
                                border: '2px solid rgba(60, 0, 165, 0.05)',
                                background: 'linear-gradient(45deg, #8400FF, #FF00F6) border-box',
                                WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                                WebkitMaskComposite: 'destination-out',
                                maskComposite: 'exclude'
                            }
                        }}
                    >
                    </Input>
                    </Box>

                    {searchResult.length > 0 && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: '30px' }}>
                            {searchResult.map((user) => (
                                <Box key={user.uid} sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    padding: '10px',
                                    borderRadius: '20px',
                                    border: '2px solid rgba(60, 0, 165, 0.05)',
                                    backgroundColor: 'rgba(244, 217, 255, 1)',
                                    width: '275px',
                                    height: '80px',
                                    marginTop: '-5px'
                                }}>
                                    <Avatar src={user.photoURL} sx={{height: '80px', width: '80px', marginLeft: '10px'}}/>
                                    <Typography level="h4" sx={{fontFamily: 'Montserrat', color: 'black', height: '100%', fontSize: '15px'}}>
                                        {`${user.name} ${user.surname}`}
                                    </Typography>
                                    {!userData?.friends.includes(user.uid!) && (
                                        <Button onClick={() => sendFriendRequest(user.uid!)} sx={{
                                            height: '30px',
                                            width: '100px',
                                            }}>
                                            Добавить в друзья
                                        </Button>
                                    )}
                                </Box>
                            ))}
                        </Box>
                    )}

                    
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
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button onClick={() => acceptFriendRequest(request.uid!)}>
                                        Принять
                                    </Button>
                                    <Button 
                                        onClick={() => rejectFriendRequest(request.uid!)}
                                        color="danger"
                                    >
                                        Отклонить
                                    </Button>
                                </Box>
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
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            }}>
                                <Avatar sx={{cursor: 'pointer'}} src={friend.photoURL} onClick={() => navigate(`/friend/${friend.uid}`)}/>
                                <Typography sx={{cursor: 'pointer'}} onClick={() => navigate(`/friend/${friend.uid}`)}>
                                    {`${friend.name} ${friend.surname}`}
                                </Typography>
                                <Button 
                                    onClick={() => removeFriend(friend.uid!)}
                                    color="danger"
                                    variant="soft"
                                >
                                    Удалить
                                </Button>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>
        </motion.div>
    );
}

export default Friends;
