import { Box, Button, Input, Textarea, Typography } from '@mui/joy';
import { useState, useRef } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, addDoc, collection } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '../firebase';
import { motion } from 'framer-motion';
import Head from '../components/Head';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

const TextColor = '#3C007D';

interface CreatePostProps {
    onClose: () => void;
    onPostCreated: () => void;
}

function CreatePost({ onClose, onPostCreated }: CreatePostProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const storage = getStorage(app);

    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreatePost = async () => {
        if (!auth.currentUser) return;
        if (!title.trim() || !content.trim()) {
            setError('Заполните все поля');
            return;
        }

        setUploading(true);
        try {
            let imageUrl = '';
            if (image) {
                const imageRef = ref(storage, `posts/${auth.currentUser.uid}/${Date.now()}`);
                await uploadBytes(imageRef, image);
                imageUrl = await getDownloadURL(imageRef);
            }

            await addDoc(collection(db, 'posts'), {
                userId: auth.currentUser.uid,
                title,
                content,
                imageUrl,
                createdAt: new Date().toISOString(),
                likes: 0,
                comments: []
            });

            setTitle('');
            setContent('');
            setImage(null);
            setImagePreview(null);
            setError('');
            
            setTimeout(() => {
                onPostCreated();
                onClose();
            }, 500);
            
        } catch (error) {
            console.error('Ошибка при создании поста:', error);
            setError('Ошибка при создании поста');
        } finally {
            setUploading(false);
        }
    };

    return (
        <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} transition={{duration: 0.6}}>
            <Box sx={{
                padding: '30px',
                borderRadius: '25px',
                position: 'relative',
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
                    maskComposite: 'exclude',
                    zIndex: -1
                },
                backgroundColor: 'white',
            }}>
                <Typography level="h2" sx={{fontFamily: 'Montserrat', color: TextColor, marginBottom: '20px'}}>
                    Создание поста
                </Typography>
                
                <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Заголовок поста"
                    sx={{marginBottom: '20px', width: '100%'}}
                />

                <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Содержание поста"
                    minRows={4}
                    sx={{marginBottom: '20px', width: '100%'}}
                />

                <input
                    type="file"
                    ref={fileInputRef}
                    style={{display: 'none'}}
                    accept="image/*"
                    onChange={handleImageSelect}
                />

                <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2}}>
                    <Button
                        onClick={() => fileInputRef.current?.click()}
                        startDecorator={<AddPhotoAlternateIcon />}
                        sx={{
                            fontFamily: 'Montserrat',
                            background: 'linear-gradient(to left, #F480FF, #B14BFF)',
                            borderRadius: '30px',
                            width: '200px',
                            height: '50px',
                        }}
                    >
                        Добавить фото
                    </Button>

                    {imagePreview && (
                        <Box sx={{
                            width: '100%',
                            maxHeight: '300px',
                            overflow: 'hidden',
                            borderRadius: '10px',
                            marginBottom: '20px'
                        }}>
                            <img 
                                src={imagePreview} 
                                alt="Preview" 
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain'
                                }}
                            />
                        </Box>
                    )}

                    <Button
                        onClick={handleCreatePost}
                        disabled={uploading}
                        sx={{
                            fontFamily: 'Montserrat',
                            background: 'linear-gradient(to left, #F480FF, #B14BFF)',
                            borderRadius: '30px',
                            width: '200px',
                            height: '50px',
                        }}
                    >
                        {uploading ? 'Создание...' : 'Создать пост'}
                    </Button>

                    {error && (
                        <Typography 
                            level="body-sm" 
                            sx={{color: 'red', fontFamily: "Montserrat"}}>
                            {error}
                        </Typography>
                    )}
                </Box>
            </Box>
        </motion.div>
    );
}

export default CreatePost;
