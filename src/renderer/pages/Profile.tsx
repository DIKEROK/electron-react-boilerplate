import { Avatar, Box, Button, Typography } from "@mui/joy";
import Head from "../components/Head";
import { useEffect, useState, useRef } from "react";
import { app } from "../firebase";
import { getAuth } from "firebase/auth";
import { doc, getDoc, updateDoc, deleteDoc, getFirestore, collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import CreatePost from '../components/CreatePost';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from "react-router-dom";

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

function Profile() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const storage = getStorage(app);
    const [friends, setFriends] = useState<UserData[]>([]);
    const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
    const [posts, setPosts] = useState<Post[]>([]);
    const [currentPostIndex, setCurrentPostIndex] = useState(0);

    const navigate = useNavigate();

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
            
            const storageRef = ref(storage, `avatars/${auth.currentUser.uid}`);
            
            await uploadBytes(storageRef, file);
            
            const downloadURL = await getDownloadURL(storageRef);
            
            const userRef = doc(db, "users", auth.currentUser.uid);
            await updateDoc(userRef, {
                photoURL: downloadURL
            });
            
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

    const fetchPosts = async () => {
        if (!auth.currentUser) return;
        
        try {
            console.log("Fetching posts...");
            const postsQuery = query(
                collection(db, "posts"),
                where("userId", "==", auth.currentUser.uid),
                orderBy("createdAt", "desc")
            );
            
            const querySnapshot = await getDocs(postsQuery);
            const fetchedPosts = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Post));
            
            console.log("Fetched posts:", fetchedPosts);
            setPosts(fetchedPosts);
            setCurrentPostIndex(0);
        } catch (error) {
            console.error("Ошибка при загрузке постов:", error);
        }
    };

    useEffect(() => {
        if (auth.currentUser) {
            fetchPosts();
        }
    }, [auth.currentUser]);

    const handlePrevPost = () => {
        setCurrentPostIndex(prev => prev + 1);
    };

    const handleNextPost = () => {
        setCurrentPostIndex(prev => prev - 1);
    };

    const handleDeletePost = async (postId: string) => {
        if (!auth.currentUser) return;
        
        try {
            await deleteDoc(doc(db, "posts", postId));
            
            const updatedPosts = posts.filter(post => post.id !== postId);
            setPosts(updatedPosts);
            
            if (currentPostIndex >= updatedPosts.length) {
                setCurrentPostIndex(Math.max(0, updatedPosts.length - 1));
            }
        } catch (error) {
            console.error("Ошибка при удалении поста:", error);
        }
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
                                width: '200px',
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
                                border: '2px solid transparent',
                                WebkitMaskComposite: 'destination-out',
                                maskComposite: 'exclude'
                            }
                        }}
                    >
                        <Typography level="h2" sx={{fontFamily: 'Montserrat', marginBottom: '20px', fontSize: '30px'}}>Друзья</Typography>
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                            {friends.map((friend, index) => (
                                <Box onClick={() => navigate(`/friend/${friend.uid}`)} key={index} sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px'}}>
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
                                border: '2px solid transparent',
                                WebkitMaskComposite: 'destination-out',
                                maskComposite: 'exclude'
                            }
                        }}
                    >
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center'}}>
                        <Typography level="h2" sx={{fontFamily: 'Montserrat', marginBottom: '20px', fontSize: '30px'}}>
                            Ваши посты
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
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                    <Typography level="h3" sx={{fontFamily: 'Montserrat', fontSize: '22px'}}>
                                        {posts[currentPostIndex]?.title}
                                    </Typography>
                                    <Button
                                        onClick={() => handleDeletePost(posts[currentPostIndex].id)}
                                        color="danger"
                                        variant="soft"
                                        sx={{
                                            fontFamily: 'Montserrat',
                                            marginBottom: '50px',
                                            minWidth: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            padding: 0
                                        }}
                                    >
                                        <DeleteIcon />
                                    </Button>
                                </Box>
                                
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
                                    <Button
                                        onClick={handleNextPost}
                                        disabled={currentPostIndex === 0}
                                        sx={{
                                            minWidth: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            padding: 0,
                                            background: 'transparent',
                                            visibility: currentPostIndex === 0 ? 'hidden' : 'visible'
                                        }}
                                    >
                                        <ArrowBackIosNewIcon />
                                    </Button>
                                    
                                    <Button
                                        onClick={handlePrevPost}
                                        disabled={currentPostIndex === posts.length - 1}
                                        sx={{
                                            minWidth: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            padding: 0,
                                            background: 'transparent',
                                            visibility: currentPostIndex === posts.length - 1 ? 'hidden' : 'visible'
                                        }}
                                    >
                                        <ArrowForwardIosIcon />
                                    </Button>
                                </Box>
                            </Box>
                        </>
                    ) : (
                        <Typography sx={{
                            fontFamily: 'Montserrat',
                            fontSize: '16px',
                            textAlign: 'center'
                        }}>
                            У вас пока нет постов
                        </Typography>
                    )}

                    <Box sx={{display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', mt: 4}}>
                        <Button 
                            onClick={() => setIsCreatePostOpen(true)}
                            sx={{
                                fontFamily: 'Montserrat',
                                background: 'linear-gradient(to left, #F480FF, #B14BFF)',
                                borderRadius: '30px',
                                width: '200px',
                                height: '50px'
                            }}
                        >
                            Написать пост
                        </Button>
                    </Box>
                </Box>
            </Box>
            {isCreatePostOpen && (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000,
                        padding: '20px'
                    }}
                    onClick={() => setIsCreatePostOpen(false)}
                >
                    <Box 
                        onClick={(e) => e.stopPropagation()}
                        sx={{
                            width: '100%',
                            maxWidth: '800px',
                            maxHeight: '90vh',
                            overflowY: 'auto'
                        }}
                    >
                        <CreatePost 
                            onClose={() => setIsCreatePostOpen(false)} 
                            onPostCreated={fetchPosts}
                        />
                    </Box>
                </Box>
            )}
        </Box>
    );
}

export default Profile;
