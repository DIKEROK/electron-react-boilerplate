import { Box, Button, Typography, Avatar, Input, List, ListItem, Checkbox } from "@mui/joy";
import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../firebase";
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

interface UserData {
    uid?: string;
    name: string;
    surname: string;
    photoURL?: string;
}

interface CreateChatProps {
    isOpen: boolean;
    onClose: () => void;
    friends: UserData[];
}

function CreateChat({ isOpen, onClose, friends }: CreateChatProps) {
    const [chatName, setChatName] = useState('');
    const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [chatAvatar, setChatAvatar] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const auth = getAuth(app);
    const db = getFirestore(app);
    const storage = getStorage(app);

    if (!isOpen) return null;

    const handleAvatarSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setChatAvatar(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreateChat = async () => {
        if (!auth.currentUser || !chatName.trim()) return;
        setUploading(true);

        try {
            let photoURL = '';
            if (chatAvatar) {
                const avatarRef = ref(storage, `chats/${Date.now()}_${chatAvatar.name}`);
                await uploadBytes(avatarRef, chatAvatar);
                photoURL = await getDownloadURL(avatarRef);
            }

            const newChat = {
                name: chatName,
                createdBy: auth.currentUser.uid,
                createdAt: new Date().toISOString(),
                members: [auth.currentUser.uid, ...selectedFriends],
                admins: [auth.currentUser.uid],
                messages: [],
                photoURL
            };

            await addDoc(collection(db, "chats"), newChat);
            setChatName('');
            setSelectedFriends([]);
            setChatAvatar(null);
            setAvatarPreview(null);
            onClose();
        } catch (error) {
            console.error("Ошибка при создании чата:", error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, backgroundColor: 'transparent' }}
            animate={{ opacity: 1, scale: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            exit={{ opacity: 0, scale: 0.9, backgroundColor: 'transparent' }}
            transition={{ duration: 0.2 }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000
            }}
            onClick={onClose}
        >
            <Box
                onClick={(e) => e.stopPropagation()}
                sx={{
                    width: '400px',
                    backgroundColor: 'white',
                    borderRadius: '25px',
                    padding: '30px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                    border: '2px solid #B689FF'
                }}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleAvatarSelect}
                />
                
                <Box
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        backgroundColor: '#F6EFFF',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer',
                        border: '2px solid #B689FF',
                        overflow: 'hidden'
                    }}
                >
                    {avatarPreview ? (
                        <img 
                            src={avatarPreview} 
                            alt="Аватар чата"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    ) : (
                        <>
                            <AddPhotoAlternateIcon sx={{ fontSize: 40, color: '#B689FF' }} />
                        </>
                    )}
                </Box>

                <Input
                    value={chatName}
                    onChange={(e) => setChatName(e.target.value)}
                    placeholder="Введите название беседы"
                    sx={{
                        width: '100%',
                        borderRadius: '30px',
                        border: '2px solid #B689FF',
                        '&:focus': {
                            border: '2px solid #9137FF'
                        }
                    }}
                />

                <Box sx={{ width: '100%' }}>
                    <Typography sx={{ fontFamily: 'Montserrat', color: '#3C007D', mb: 2 }}>
                        Добавьте участников
                    </Typography>
                    <List>
                        {friends.map(friend => (
                            <ListItem 
                                key={friend.uid}
                                sx={{
                                    borderRadius: '15px',
                                    mb: 1,
                                    '&:hover': {
                                        backgroundColor: '#F6EFFF'
                                    }
                                }}
                            >
                                <Avatar src={friend.photoURL} />
                                <Typography sx={{ ml: 2, flex: 1 }}>
                                    {`${friend.name} ${friend.surname}`}
                                </Typography>
                                <Checkbox
                                    checked={selectedFriends.includes(friend.uid!)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedFriends([...selectedFriends, friend.uid!]);
                                        } else {
                                            setSelectedFriends(selectedFriends.filter(id => id !== friend.uid));
                                        }
                                    }}
                                    sx={{
                                        color: '#B689FF',
                                        '&.Mui-checked': {
                                            color: '#9137FF'
                                        }
                                    }}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Box>

                <Button
                    onClick={handleCreateChat}
                    disabled={!chatName.trim() || uploading}
                    color="white"
                    sx={{
                        width: '200px',
                        height: '45px',
                        borderRadius: '30px',
                        background: 'linear-gradient(to left, #F480FF, #B14BFF)',
                        '&:hover': {
                            background: 'linear-gradient(to left, #B14BFF, #8400FF)'
                        }
                    }}
                >
                    {uploading ? 'Создание...' : 'Создать'}
                </Button>
            </Box>
        </motion.div>
    );
}

export default CreateChat;