import { Avatar, Box, Typography } from "@mui/joy";
import Head from "../components/Head";
import { useEffect, useState } from "react";
import { app } from "../firebase";
import { getAuth } from "firebase/auth";
import { doc, getDoc, getFirestore, collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUpRounded';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDownRounded';

interface UserData {
    uid?: string;
    name: string;
    surname: string;
    patronymic: string;
    photoURL?: string;
    friends?: string[];
}

interface Post {
    id: string;
    title: string;
    content: string;
    imageUrl?: string;
    createdAt: string;
    userId: string;
    likes: number;
    comments: any[];
}

function FriendProfile() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [friends, setFriends] = useState<UserData[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [currentPostIndex, setCurrentPostIndex] = useState(0);
    const [currentFriendIndex, setCurrentFriendIndex] = useState(0);
    
    const { friendId } = useParams();
    const auth = getAuth(app);
    const db = getFirestore(app);
    const navigate = useNavigate();

    const getInitials = () => {
        if (userData) {
            const firstInitial = userData.name.charAt(0);
            const lastInitial = userData.surname.charAt(0);
            return `${firstInitial}${lastInitial}`.toUpperCase();
        }
        return '';
    };

    useEffect(() => {
        const fetchUserData = async () => {
            if (friendId) {
                const userDoc = await getDoc(doc(db, "users", friendId));
                if (userDoc.exists()) {
                    setUserData(userDoc.data() as UserData);
                }
            }
        };

        fetchUserData();
    }, [friendId]);

    useEffect(() => {
        const fetchFriends = async () => {
            if (!userData?.friends) return;
            
            try {
                const friendsData = await Promise.all(
                    userData.friends.map(async (friendId) => {
                        const friendDoc = await getDoc(doc(db, "users", friendId));
                        return { ...friendDoc.data(), uid: friendId } as UserData;
                    })
                );
                setFriends(friendsData);
            } catch (error) {
                console.error("Ошибка при загрузке друзей:", error);
            }
        };

        fetchFriends();
    }, [userData?.friends]);

    useEffect(() => {
        const fetchPosts = async () => {
            if (!friendId) return;
            
            try {
                const postsQuery = query(
                    collection(db, "posts"),
                    where("userId", "==", friendId),
                    orderBy("createdAt", "desc")
                );
                
                const querySnapshot = await getDocs(postsQuery);
                const fetchedPosts = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Post));
                
                setPosts(fetchedPosts);
                setCurrentPostIndex(0);
            } catch (error) {
                console.error("Ошибка при загрузке постов:", error);
            }
        };

        fetchPosts();
    }, [friendId]);

    const handlePrevPost = () => {
        setCurrentPostIndex(prev => prev + 1);
    };

    const handleNextPost = () => {
        setCurrentPostIndex(prev => prev - 1);
    };

    const handlePrevFriends = () => {
        setCurrentFriendIndex(prev => Math.max(0, prev - 2));
    };

    const handleNextFriends = () => {
        setCurrentFriendIndex(prev => 
            Math.min(prev + 2, Math.max(0, friends.length - 2))
        );
    };

    return (
        <Box>
            <Box sx={{display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '50px'}}>
                <Head />
            </Box>
            <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: '50px'}}>
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
                        background: 'linear-gradient(to top, #E7E6FF, #E5CDFF)',
                        borderRadius: '25px',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            borderRadius: '25px',
                            border: '2px solid rgba(60, 0, 125, 0.1)',
                            WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                            WebkitMaskComposite: 'destination-out',
                            maskComposite: 'exclude'
                        }
                    }}>
                        <Typography level="h2" sx={{fontFamily: 'Montserrat', marginBottom: '20px', fontSize: '30px'}}>
                            Друзья
                        </Typography>
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative'}}>
                            <Box sx={{
                                position: 'absolute',
                                top: -40,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                visibility: currentFriendIndex > 0 ? 'visible' : 'hidden',
                                cursor: 'pointer',
                                zIndex: 1
                            }} onClick={handlePrevFriends}>
                                <ArrowDropUpIcon sx={{ fontSize: 40 }} />
                            </Box>
                            
                            {friends.slice(currentFriendIndex, currentFriendIndex + 2).map((friend, index) => (
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
                            
                            <Box sx={{
                                position: 'absolute',
                                bottom: -40,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                visibility: currentFriendIndex + 2 < friends.length ? 'visible' : 'hidden',
                                cursor: 'pointer',
                                zIndex: 1
                            }} onClick={handleNextFriends}>
                                <ArrowDropDownIcon sx={{ fontSize: 40 }} />
                            </Box>
                        </Box>
                    </Box>
                </Box>
                <Box sx={{
                    width: '500px', 
                    height: '510px',
                    marginBottom: '20px',
                    position: 'relative',
                    padding: '30px',
                    boxShadow: 'none',
                    borderColor: 'rgba(0, 0, 0, 0)',
                    background: 'linear-gradient(to top, #E7E6FF, #E5CDFF)',
                    borderRadius: '25px',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: '25px',
                        border: '2px solid rgba(60, 0, 125, 0.1)',
                        WebkitMaskComposite: 'destination-out',
                        maskComposite: 'exclude'
                    }
                }}>
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center'}}>
                        <Typography level="h2" sx={{fontFamily: 'Montserrat', marginBottom: '20px', fontSize: '30px'}}>
                            Посты
                        </Typography>
                    </Box>
                    
                    {posts.length > 0 ? (
                        <>
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '20px',
                                background: 'transparent',
                                borderRadius: '25px',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: '300px',
                                position: 'relative'
                            }}>
                                <Typography level="h3" sx={{fontFamily: 'Montserrat', fontSize: '22px'}}>
                                    {posts[currentPostIndex]?.title}
                                </Typography>
                                
                                {posts[currentPostIndex]?.imageUrl && (
                                    <Box sx={{
                                        width: '100%',
                                        height: '200px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}>
                                        <img 
                                            src={posts[currentPostIndex].imageUrl}
                                            alt="Post"
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: '100%',
                                                objectFit: 'contain'
                                            }}
                                        />
                                    </Box>
                                )}
                                
                                <Typography sx={{
                                    fontFamily: 'Montserrat',
                                    fontSize: '16px',
                                    textAlign: 'center',
                                    maxHeight: '100px',
                                    overflow: 'auto'
                                }}>
                                    {posts[currentPostIndex]?.content}
                                </Typography>

                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    width: '100%',
                                    position: 'absolute',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    px: 2
                                }}>
                                    <Box
                                        onClick={handleNextPost}
                                        sx={{
                                            visibility: currentPostIndex === 0 ? 'hidden' : 'visible',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <ArrowBackIosNewIcon />
                                    </Box>
                                    
                                    <Box
                                        onClick={handlePrevPost}
                                        sx={{
                                            visibility: currentPostIndex === posts.length - 1 ? 'hidden' : 'visible',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <ArrowForwardIosIcon />
                                    </Box>
                                </Box>
                            </Box>
                        </>
                    ) : (
                        <Typography sx={{
                            fontFamily: 'Montserrat',
                            fontSize: '16px',
                            textAlign: 'center'
                        }}>
                            У пользователя пока нет постов
                        </Typography>
                    )}
                </Box>
            </Box>
        </Box>
    );
}

export default FriendProfile;