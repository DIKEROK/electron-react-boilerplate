import { Box, Typography, Avatar, Button, Textarea } from '@mui/joy';
import { motion } from 'framer-motion';
import "@fontsource/montserrat";
import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, orderBy, getDocs, getDoc, doc, addDoc, onSnapshot } from 'firebase/firestore';
import { app } from '../firebase';
import Head from '../components/Head';
import { useNavigate } from 'react-router-dom';

const TextColor = '#3C007D';

interface Comment {
    id: string;
    userId: string;
    content: string;
    createdAt: string;
    author?: {
        name: string;
        surname: string;
        photoURL?: string;
    };
}

interface Post {
    id: string;
    userId: string; 
    title: string;
    content: string;
    imageUrl?: string;
    createdAt: string;
    likes: number;
    comments: Comment[];
    theme: string;
    author?: {
        name: string;
        surname: string;
        photoURL?: string;
    };
    commentsUnsubscribe?: () => void;
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
    const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const navigate = useNavigate();
    const [newComments, setNewComments] = useState<{ [key: string]: string }>({});

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
        const postsRef = collection(db, "posts");
        const postsQuery = query(postsRef, orderBy("createdAt", "desc"));

        const unsubscribePosts = onSnapshot(postsQuery, async (querySnapshot) => {
            const allPosts = await Promise.all(querySnapshot.docs.map(async (docSnap) => {
                const postData = docSnap.data() as Post;
                const userDoc = await getDoc(doc(db, "users", postData.userId));
                const userData = userDoc.data();

                // Слушатель комментариев для каждого поста
                const commentsRef = collection(db, "posts", docSnap.id, "comments");
                const unsubscribeComments = onSnapshot(commentsRef, (commentsSnapshot) => {
                    const comments: Comment[] = commentsSnapshot.docs.map(commentDoc => ({
                        id: commentDoc.id,
                        ...commentDoc.data()
                    } as Comment));

                    setPosts(prevPosts => prevPosts.map(post => {
                        if (post.id === docSnap.id) {
                            return {
                                ...post,
                                comments,
                                author: {
                                    name: userData?.name || '',
                                    surname: userData?.surname || '',
                                    photoURL: userData?.photoURL
                                }
                            };
                        }
                        return post;
                    }));
                });

                return {
                    id: docSnap.id,
                    ...postData,
                    comments: [], // Изначально пусто, будет обновлено слушателем
                    author: {
                        name: userData?.name || '',
                        surname: userData?.surname || '',
                        photoURL: userData?.photoURL
                    },
                    commentsUnsubscribe: unsubscribeComments
                } as Post;
            }));

            setPosts(allPosts);
        });

        // Очистка слушателей при размонтировании компонента
        return () => {
            unsubscribePosts();
            // Также нужно очистить все слушатели комментариев
            posts.forEach(post => {
                if (post.commentsUnsubscribe) post.commentsUnsubscribe();
            });
        };
    }, []);

    const handleUserClick = (userId: string) => {
        navigate(`/friend/${userId}`);
    };

    const filteredPosts = selectedTheme 
        ? posts.filter(post => post.theme === selectedTheme)
        : posts;

    const handleCommentChange = (postId: string, value: string) => {
        setNewComments(prev => ({ ...prev, [postId]: value }));
    };

    const handleAddComment = async (postId: string) => {
        if (!auth.currentUser) return;
        const commentContent = newComments[postId]?.trim();
        if (!commentContent) return;

        try {
            const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
            const userData = userDoc.data();

            const commentRef = collection(db, "posts", postId, "comments");
            const newComment = {
                userId: auth.currentUser.uid,
                content: commentContent,
                createdAt: new Date().toISOString(),
                author: {
                    name: userData?.name || '',
                    surname: userData?.surname || '',
                    photoURL: userData?.photoURL || ''
                }
            };
            await addDoc(commentRef, newComment);

            // Очистка поля ввода комментария
            setNewComments(prev => ({ ...prev, [postId]: '' }));
        } catch (error) {
            console.error("Ошибка при добавлении комментария:", error);
        }
    };

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

            {filteredPosts.length === 0 ? (
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
                                    <Typography sx={{cursor: 'pointer', fontFamily: 'Montserrat', color: TextColor}} level="h4" onClick={() => handleUserClick(post.userId)}>
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

                            {/* Раздел комментариев */}
                            <Box sx={{ marginTop: '20px' }}>
                                <Typography level="h4" sx={{ fontFamily: 'Montserrat', color: TextColor, marginBottom: '10px' }}>
                                    Комментарии
                                </Typography>
                                {post.comments.map(comment => (
                                    <Box key={comment.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, marginBottom: '10px' }}>
                                        <Avatar 
                                            src={comment.author?.photoURL}
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => handleUserClick(comment.userId)}
                                        >
                                            {comment.author?.name?.[0]}{comment.author?.surname?.[0]}
                                        </Avatar>
                                        <Box>
                                            <Typography sx={{ fontFamily: 'Montserrat', color: TextColor, fontWeight: 'bold' }}>
                                                {comment.author?.name} {comment.author?.surname}
                                            </Typography>
                                            <Typography sx={{ fontFamily: 'Montserrat', color: TextColor }}>
                                                {comment.content}
                                            </Typography>
                                            <Typography sx={{ fontFamily: 'Montserrat', color: TextColor, fontSize: '12px', opacity: 0.7 }}>
                                                {formatDate(comment.createdAt)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))}

                                {/* Поле для добавления нового комментария */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginTop: '10px' }}>
                                    <Avatar 
                                        src={auth.currentUser?.photoURL || ''}
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => handleUserClick(auth.currentUser!.uid)}
                                    >
                                        {auth.currentUser?.displayName?.[0] || 'U'}
                                    </Avatar>
                                    <Textarea
                                        placeholder="Добавьте комментарий..."
                                        value={newComments[post.id] || ''}
                                        onChange={(e) => handleCommentChange(post.id, e.target.value)}
                                        sx={{ flex: 1, fontFamily: 'Montserrat' }}
                                    />
                                    <Button onClick={() => handleAddComment(post.id)} sx={{ fontFamily: 'Montserrat' }}>
                                        Отправить
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    ))}
                </Box>
            )}
        </motion.div>
    );
}

export default News;