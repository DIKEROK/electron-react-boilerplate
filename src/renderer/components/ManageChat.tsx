import { Box, Button, Typography, Avatar, Input, List, ListItem, IconButton } from "@mui/joy";
import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import DeleteIcon from '@mui/icons-material/Delete';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { app } from "../firebase";

interface UserData {
    uid?: string;
    name: string;
    surname: string;
    photoURL?: string;
    friends: string[];
}

interface Chat {
    id: string;
    name: string;
    createdBy: string;
    createdAt: string;
    members: string[];
    admins: string[];
    messages: Message[];
    photoURL?: string;
}

interface Message {
    id: string;
    senderId: string;
    text: string;
    timestamp: string;
}

interface ManageChatProps {
    isOpen: boolean;
    onClose: () => void;
    chat: Chat | null;
    friends: UserData[];
    onMemberRemove: (userId: string) => Promise<void>;
    onMemberAdd: (userId: string) => Promise<void>;
    onMakeAdmin: (userId: string) => Promise<void>;
    onRemoveAdmin: (userId: string) => Promise<void>;
    onDeleteChat?: () => Promise<void>;
}

function ManageChat({ isOpen, onClose, chat, friends, onMemberRemove, onMemberAdd, onMakeAdmin, onRemoveAdmin, onDeleteChat }: ManageChatProps) {
    const [chatName, setChatName] = useState(chat?.name || '');
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const storage = getStorage(app);

    if (!isOpen || !chat) return null;

    // Проверка является ли текущий пользователь администратором
    const isCurrentUserAdmin = chat.admins.includes(auth.currentUser?.uid || '');

    const handleNameChange = async () => {
        if (!chat || !chatName.trim() || !isCurrentUserAdmin) return;

        try {
            const chatRef = doc(db, "chats", chat.id);
            await updateDoc(chatRef, {
                name: chatName.trim()
            });
        } catch (error) {
            console.error("Ошибка при изменении названия:", error);
        }
    };

    const handleFileSelect = () => {
        if (!isCurrentUserAdmin) return;
        fileInputRef.current?.click();
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !chat || !isCurrentUserAdmin) return;

        try {
            setUploading(true);
            const storageRef = ref(storage, `chat-avatars/${chat.id}`);
            await uploadBytes(storageRef, file);
            const photoURL = await getDownloadURL(storageRef);

            const chatRef = doc(db, "chats", chat.id);
            await updateDoc(chatRef, { photoURL });
        } catch (error) {
            console.error("Ошибка при загрузке фото:", error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <>
            <motion.div
                onClick={onClose}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}
            >
                <motion.div
                    onClick={(e) => e.stopPropagation()}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                        width: '500px',
                        backgroundColor: 'white',
                        borderRadius: '20px',
                        padding: '30px',
                        maxHeight: '80vh',
                        overflowY: 'auto'
                    }}
                >
                    <Typography level="h2" sx={{ fontFamily: 'Montserrat', marginBottom: '20px' }}>
                        Управление чатом
                    </Typography>

                    {isCurrentUserAdmin ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {/* Аватар чата */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar
                                    src={chat.photoURL}
                                    sx={{ width: 100, height: 100 }}
                                />
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
                                    }}
                                >
                                    {uploading ? 'Загрузка...' : 'Изменить фото'}
                                </Button>
                            </Box>

                            {/* Название чата */}
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Input
                                    value={chatName}
                                    onChange={(e) => setChatName(e.target.value)}
                                    placeholder="Название беседы"
                                    sx={{ flex: 1 }}
                                />
                                <Button onClick={handleNameChange}>Сохранить</Button>
                            </Box>
                        </Box>
                    ) : (
                        <Typography sx={{ color: 'text.secondary', marginBottom: 2 }}>
                            Только администраторы могут управлять настройками чата
                        </Typography>
                    )}

                    {/* Список участников */}
                    <Box>
                        <Typography level="h3" sx={{ fontFamily: 'Montserrat', marginBottom: '10px' }}>
                            Участники
                        </Typography>
                        <List>
                            {chat.members.map(memberId => {
                                const member = friends.find(f => f.uid === memberId);
                                if (!member) return null;

                                return (
                                    <ListItem key={memberId}>
                                        <Avatar src={member.photoURL} />
                                        <Typography>{`${member.name} ${member.surname}`}</Typography>
                                        {isCurrentUserAdmin && memberId !== chat.createdBy && (
                                            <>
                                                <IconButton onClick={() => onMemberRemove(memberId)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                                {chat.admins.includes(memberId) ? (
                                                    <IconButton 
                                                        onClick={() => onRemoveAdmin(memberId)}
                                                        color="danger"
                                                    >
                                                        <AdminPanelSettingsIcon />
                                                    </IconButton>
                                                ) : (
                                                    <IconButton onClick={() => onMakeAdmin(memberId)}>
                                                        <AdminPanelSettingsIcon />
                                                    </IconButton>
                                                )}
                                            </>
                                        )}
                                        {chat.admins.includes(memberId) && (
                                            <Typography sx={{ ml: 1, color: 'text.secondary' }}>
                                                (Админ)
                                            </Typography>
                                        )}
                                    </ListItem>
                                );
                            })}
                        </List>
                    </Box>

                    {/* Добавление новых участников */}
                    {isCurrentUserAdmin && (
                        <Box>
                            <Typography level="h3" sx={{ fontFamily: 'Montserrat', marginBottom: '10px' }}>
                                Добавить участников
                            </Typography>
                            <List>
                                {friends
                                    .filter(friend => !chat.members.includes(friend.uid!))
                                    .map(friend => (
                                        <ListItem key={friend.uid}>
                                            <Avatar src={friend.photoURL} />
                                            <Typography>{`${friend.name} ${friend.surname}`}</Typography>
                                            <Button onClick={() => onMemberAdd(friend.uid!)}>
                                                Добавить
                                            </Button>
                                        </ListItem>
                                    ))}
                            </List>
                        </Box>
                    )}

                    {isCurrentUserAdmin && chat.createdBy === auth.currentUser?.uid && (
                        <Box sx={{ marginTop: 2 }}>
                            <Button
                                color="danger"
                                onClick={onDeleteChat}
                                sx={{
                                    fontFamily: 'Montserrat',
                                    width: '100%'
                                }}
                            >
                                Удалить чат
                            </Button>
                        </Box>
                    )}
                </motion.div>
            </motion.div>
        </>
    );
}

export default ManageChat;
