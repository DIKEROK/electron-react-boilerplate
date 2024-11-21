import { Box, Typography, Avatar, Button } from '@mui/joy';
import { motion } from 'framer-motion';
import "@fontsource/montserrat";
import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, orderBy, getDocs, getDoc, doc } from 'firebase/firestore';
import { app } from '../firebase';
import Head from '../components/Head';
import { useNavigate } from 'react-router-dom';

const TextColor = '#3C007D';

interface Post {
    id: string;
    userId: string;
    title: string;
    content: string;
    imageUrl?: string;
    createdAt: string;
    likes: number;
    comments: any[];
    theme: string;
    author?: {
        name: string;
        surname: string;
        photoURL?: string;
    };
}

const POST_THEMES = [
    { id: 'study', label: 'Учеба', color: '#FF80F2' },
    { id: 'events', label: 'Мероприятия', color: '#80ACFF' },
    { id: 'projects', label: 'Проекты', color: '#80FFB6' },
    { id: 'career', label: 'Спорт', color: '#FFB680' },
    { id: 'questions', label: 'Вопросы', color: '#FF8080' },
    { id: 'other', label: 'Другое', color: '#B680FF' }
];

function News() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [hasFriends, setHasFriends] = useState<boolean | null>(null);
    const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const navigate = useNavigate();

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    useEffect(() => {
        const fetchPosts = async () => {
            if (!auth.currentUser) return;

            try {
                const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
                const userData = userDoc.data();
                
                if (!userData?.friends?.length) {
                    setHasFriends(false);
                    return;
                }
                
                setHasFriends(true);

                const friendsPosts = await Promise.all(
                    userData.friends.map(async (friendId: string) => {
                        const friendPostsQuery = query(
                            collection(db, "posts"),
                            where("userId", "==", friendId),
                            orderBy("createdAt", "desc")
                        );
                        
                        const querySnapshot = await getDocs(friendPostsQuery);
                        const friendDoc = await getDoc(doc(db, "users", friendId));
                        const friendData = friendDoc.data();
                        
                        return querySnapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data(),
                            author: {
                                name: friendData?.name || '',
                                surname: friendData?.surname || '',
                                photoURL: friendData?.photoURL
                            }
                        } as Post));
                    })
                );

                const allPosts = friendsPosts
                    .flat()
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                setPosts(allPosts);
            } catch (error) {
                console.error("Ошибка при загрузке постов:", error);
            }
        };

        fetchPosts();
    }, [auth.currentUser]);

    const handleUserClick = (userId: string) => {
        navigate(`/friend/${userId}`);
    };

    const filteredPosts = selectedTheme 
        ? posts.filter(post => post.theme === selectedTheme)
        : posts;

    return (
        <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} transition={{duration: 0.6}}>
            <Box sx={{display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '50px'}}>
                <Head />
            </Box>
            
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: 2, 
                marginBottom: '30px',
                marginTop: '50px'
            }}>
                <Button
                    onClick={() => setSelectedTheme(null)}
                    sx={{
                        fontFamily: 'Montserrat',
                        backgroundColor: !selectedTheme ? 'rgba(132, 0, 255, 0.1)' : 'transparent',
                        color: TextColor,
                        '&:hover': {
                            backgroundColor: 'rgba(132, 0, 255, 0.1)'
                        }
                    }}
                >
                    Все
                </Button>
                {POST_THEMES.map((theme) => (
                    <Button
                        key={theme.id}
                        onClick={() => setSelectedTheme(theme.id)}
                        sx={{
                            fontFamily: 'Montserrat',
                            backgroundColor: selectedTheme === theme.id ? `${theme.color}15` : 'transparent',
                            color: theme.color,
                            '&:hover': {
                                backgroundColor: `${theme.color}15`
                            }
                        }}
                    >
                        {theme.label}
                    </Button>
                ))}
            </Box>

            {hasFriends === false ? (
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '200px'
                }}>
                    <Typography 
                        level="h3" 
                        sx={{
                            fontFamily: 'Montserrat', 
                            color: TextColor,
                            textAlign: 'center'
                        }}
                    >
                        Вы пока не подписаны ни на одного друга!
                    </Typography>
                </Box>
            ) : filteredPosts.length === 0 ? (
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '200px'
                }}>
                    <Typography 
                        level="h3" 
                        sx={{
                            fontFamily: 'Montserrat', 
                            color: TextColor,
                            textAlign: 'center'
                        }}
                    >
                        Сегодня новостей нет
                    </Typography>
                </Box>
            ) : (
                <Box sx={{display: 'flex', flexDirection: 'column', gap: 4, padding: '20px'}}>
                    {filteredPosts.map((post) => (
                        <Box key={post.id} sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            padding: '20px',
                            borderRadius: '20px',
                            position: 'relative',
                            backgroundColor: '#F6EFFF',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                borderRadius: '20px',
                                border: '2px solid transparent',
                                background: 'linear-gradient(45deg, #8400FF, #FF00F6) border-box',
                                WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                                WebkitMaskComposite: 'destination-out',
                                maskComposite: 'exclude',
                                zIndex: -1
                            }
                        }}>
                            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                    <Avatar 
                                        src={post.author?.photoURL}
                                        sx={{
                                            width: 50,
                                            height: 50,
                                            background: 'linear-gradient(45deg, #959AFF, #D89EFF)',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => handleUserClick(post.userId)}
                                    >
                                        {post.author?.name?.[0]}{post.author?.surname?.[0]}
                                    </Avatar>
                                    <Typography sx={{cursor: 'pointer', fontFamily: 'Montserrat', color: TextColor}} onClick={() => handleUserClick(post.userId)} level="h4">
                                        {post.author?.name} {post.author?.surname}
                                    </Typography>
                                </Box>
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                    <Typography 
                                        level="body-sm" 
                                        sx={{
                                            fontFamily: 'Montserrat', 
                                            color: TextColor,
                                            opacity: 0.7
                                        }}
                                    >
                                        {formatDate(post.createdAt)}
                                    </Typography>
                                    <Typography
                                        level="body-sm"
                                        sx={{
                                            fontFamily: 'Montserrat',
                                            color: POST_THEMES.find(theme => theme.id === post.theme)?.color || '#B680FF',
                                            backgroundColor: `${POST_THEMES.find(theme => theme.id === post.theme)?.color}15` || '#B680FF15',
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '12px'
                                        }}
                                    >
                                        {POST_THEMES.find(theme => theme.id === post.theme)?.label || 'Другое'}
                                    </Typography>
                                </Box>
                            </Box>
                            
                            <Typography level="h3" sx={{fontFamily: 'Montserrat', color: TextColor}}>
                                {post.title}
                            </Typography>                    
                            {post.imageUrl && (
                                <Box sx={{
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderRadius: '10px',
                                    overflow: 'hidden'
                                }}>
                                    <img 
                                        src={post.imageUrl}
                                        alt="Post"
                                        style={{
                                            maxWidth: '100%',
                                            maxHeight: '400px',
                                            objectFit: 'contain',
                                            borderRadius: '10px'
                                        }}
                                    />
                                </Box>
                            )}
                            
                            <Typography sx={{fontFamily: 'Montserrat', color: TextColor}}>
                                {post.content}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            )}
        </motion.div>
    );
}

export default News;