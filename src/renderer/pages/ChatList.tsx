import { Box, Button, Input, Typography, Modal, List, ListItem, Avatar, IconButton, Checkbox, Divider } from '@mui/joy';
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc, query, where, getDocs, updateDoc, doc, onSnapshot, deleteDoc, getDoc } from "firebase/firestore";
import { app } from '../firebase';
import Head from "../components/Head";
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ManageChat from '../components/ManageChat';
import { motion } from "framer-motion";
import SendIcon from '@mui/icons-material/Send';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import AttachFileIcon from '@mui/icons-material/AttachFile';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CreateChat from '../components/CreateChat';
const TextColor = '#3C007D'

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
    senderName?: string;
    senderAvatar?: string;
    fileURL?: string;
    fileType?: 'image' | 'document';
    fileName?: string;
}

interface UserData {
    uid?: string;
    name: string;
    surname: string;
    photoURL?: string;
}

function ChatList() {
    const [message, setMessage] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [chatName, setChatName] = useState('');
    const [chats, setChats] = useState<Chat[]>([]);
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const [friends, setFriends] = useState<UserData[]>([]);
    const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const [isManageChatOpen, setIsManageChatOpen] = useState(false);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const auth = getAuth(app);
    const db = getFirestore(app);
    const navigate = useNavigate();

    useEffect(() => {
        if (!auth.currentUser) return;

        const fetchChats = async () => {
            const q = query(
                collection(db, "chats"),
                where("members", "array-contains", auth.currentUser!.uid)
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const fetchedChats = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Chat));
                setChats(fetchedChats);
            });

            return () => unsubscribe();
        };

        fetchChats();
    }, [auth.currentUser]);

    useEffect(() => {
        if (!auth.currentUser) return;

        const fetchFriends = async () => {
            if (!auth.currentUser) return;

            try {
                const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
                const userData = userDoc.data();
                if (!userData?.friends) return;

                const friendsData = await Promise.all(
                    userData.friends.map(async (friendId: string) => {
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
    }, [auth.currentUser]);

    useEffect(() => {
        if (!selectedChat) return;

        const chatRef = doc(db, "chats", selectedChat.id);
        const unsubscribe = onSnapshot(chatRef, (doc) => {
            if (doc.exists()) {
                const chatData = { id: doc.id, ...doc.data() } as Chat;
                setSelectedChat(chatData);
            } else {
                setSelectedChat(null);
            }
        });

        return () => unsubscribe();
    }, [selectedChat?.id]);

    useEffect(() => {
        scrollToBottom();
    }, [selectedChat?.messages]);

    const createChat = async () => {
        if (!auth.currentUser || !chatName.trim()) return;

        try {
            const newChat = {
                name: chatName,
                createdBy: auth.currentUser.uid,
                createdAt: new Date().toISOString(),
                members: [auth.currentUser.uid, ...selectedFriends],
                admins: [auth.currentUser.uid],
                messages: []
            };

            await addDoc(collection(db, "chats"), newChat);
            setIsCreateModalOpen(false);
            setChatName('');
            setSelectedFriends([]);
        } catch (error) {
            console.error("Ошибка при создании чата:", error);
        }
    };

    const handleUserClick = (userId: string) => {
        navigate(`/friend/${userId}`);
    };

    const sendMessage = async () => {
        if (!auth.currentUser || !selectedChat || !message.trim()) return;

        try {
            const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
            const userData = userDoc.data() as UserData;

            const newMessage = {
                id: Date.now().toString(),
                senderId: auth.currentUser.uid,
                text: message,
                timestamp: new Date().toISOString(),
                senderName: `${userData.name} ${userData.surname}`,
                senderAvatar: userData.photoURL || ''
            };

            const chatRef = doc(db, "chats", selectedChat.id);
            await updateDoc(chatRef, {
                messages: [...selectedChat.messages, newMessage]
            });

            setMessage('');
        } catch (error) {
            console.error("Ошибка при отправке сообщения:", error);
        }
    };

    const deleteChat = async () => {
        if (!selectedChat || !auth.currentUser) return;

        try {
            await deleteDoc(doc(db, "chats", selectedChat.id));
            setSelectedChat(null);
            setIsManageChatOpen(false);
        } catch (error) {
            console.error("Ошибка при удалении чата:", error);
        }
    };

    const addMember = async (userId: string) => {
        if (!selectedChat) return;

        try {
            const chatRef = doc(db, "chats", selectedChat.id);
            await updateDoc(chatRef, {
                members: [...selectedChat.members, userId]
            });
            setIsAddMemberModalOpen(false);
        } catch (error) {
            console.error("Ошибка при добавлении участника:", error);
        }
    };

    const makeAdmin = async (userId: string) => {
        if (!selectedChat) return;

        try {
            const chatRef = doc(db, "chats", selectedChat.id);
            await updateDoc(chatRef, {
                admins: [...selectedChat.admins, userId]
            });
        } catch (error) {
            console.error("Ошибка при назначении администратора:", error);
        }
    };

    const removeAdmin = async (userId: string) => {
        if (!selectedChat) return;
        
        try {
            const chatRef = doc(db, "chats", selectedChat.id);
            await updateDoc(chatRef, {
                admins: selectedChat.admins.filter(id => id !== userId)
            });
        } catch (error) {
            console.error("Ошибка при снятии админа:", error);
        }
    };

    const removeMember = async (userId: string) => {
        if (!selectedChat) return;

        try {
            const chatRef = doc(db, "chats", selectedChat.id);
            await updateDoc(chatRef, {
                members: selectedChat.members.filter(id => id !== userId)
            });
        } catch (error) {
            console.error("Ошибка при удалении участника:", error);
        }
    };

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    };

    const handleFileUpload = async (file: File) => {
        if (!auth.currentUser || !selectedChat) return;
        
        try {
            const storage = getStorage(app);
            const fileRef = ref(storage, `chats/${selectedChat.id}/${Date.now()}_${file.name}`);
            
            await uploadBytes(fileRef, file);
            const downloadURL = await getDownloadURL(fileRef);
            
            const fileType = file.type.startsWith('image/') ? 'image' : 'document';
            
            const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
            const userData = userDoc.data() as UserData;

            const newMessage = {
                id: Date.now().toString(),
                senderId: auth.currentUser.uid,
                text: message,
                timestamp: new Date().toISOString(),
                senderName: `${userData.name} ${userData.surname}`,
                senderAvatar: userData.photoURL || '',
                fileURL: downloadURL,
                fileType: fileType,
                fileName: file.name
            };

            const chatRef = doc(db, "chats", selectedChat.id);
            await updateDoc(chatRef, {
                messages: [...selectedChat.messages, newMessage]
            });

            setMessage('');
            setSelectedFile(null);
        } catch (error) {
            console.error("Ошибка при загрузке файла:", error);
        }
    };

    return (
        <Box>
            <Box sx={{display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '50px'}}>
                <Head />
            </Box>
            <Box>
                <Box sx={{display:'flex', gap:'20px'}}>
                    <Box>
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: 2, 
                            padding: '20px',
                            maxHeight: '500px',
                            overflowY: 'auto',
                            backgroundColor: 'rgba(255, 255, 255, 0.3)',
                            borderRadius: '23px 23px 0 0',
                            '&::-webkit-scrollbar': {
                                width: '8px',
                            },
                            '&::-webkit-scrollbar-track': {
                                background: '#F6EFFF',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                background: '#B689FF',
                                borderRadius: '4px',
                            }
                        }}>
                            {chats.map(chat => {
                                const isPrivate = chat.members.length === 2;
                                let chatDisplayName = chat.name;
                                let chatDisplayAvatar = chat.photoURL;

                                if (isPrivate) {
                                    const otherUserId = chat.members.find(id => id !== auth.currentUser?.uid);
                                    const otherUser = friends.find(user => user.uid === otherUserId);
                                    if (otherUser) {
                                        chatDisplayName = `${otherUser.name} ${otherUser.surname}`;
                                        chatDisplayAvatar = otherUser.photoURL;
                                    }
                                }

                                return (
                                    <Box 
                                        key={chat.id}
                                        onClick={() => setSelectedChat(chat)}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2,
                                            cursor: 'pointer',
                                            padding: '10px',
                                            borderRadius: '10px',
                                            backgroundColor: selectedChat?.id === chat.id ? '#F6EFFF' : 'transparent',
                                            '&:hover': {
                                                backgroundColor: '#F6EFFF',
                                            }
                                        }}
                                    >
                                        <Avatar
                                            src={chatDisplayAvatar}
                                            sx={{ 
                                                width: 50, 
                                                height: 50,
                                                background: 'linear-gradient(45deg, #959AFF, #D89EFF)'
                                            }}
                                        >
                                            {chatDisplayName.charAt(0)}
                                        </Avatar>
                                        <Typography>{chatDisplayName}</Typography>
                                    </Box>
                                )
                            })}
                        </Box>
                        <Box
                            onClick={() => setIsCreateModalOpen(true)}
                            sx={{
                                width: '277px', 
                                height: '63px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                borderRadius: '0 0 23px 23px',
                                padding: '10px',
                            }}
                        >
                            <Box sx={{width: '50px', height: '50px', display: 'flex', marginTop: '5px', justifyContent: 'center', background: 'linear-gradient(to right, #B689FF, #9137FF)', alignItems: 'center', border: '1px solid #B689FF', borderRadius: '100%'}}>
                                <Typography sx={{fontSize: '30px', color: 'white'}}>+</Typography>
                            </Box>
                            <Typography sx={{fontSize: '14px', color: TextColor, fontFamily: 'Montserrat'}}>Создать беседу</Typography>
                        </Box>
                    </Box>
                    
                    {selectedChat && (
                        <Box sx={{
                            display: 'flex', 
                            flexDirection: 'column',
                            flex: 1
                        }}>
                            <Box>
                                <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor: '#F6EFFF', borderRadius: '23px 23px 0 0', padding: '20px', alignItems: 'center'}}>
                                    <Box onClick={() => setIsManageChatOpen(true)} sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}>
                                        <Avatar
                                            src={selectedChat.photoURL}
                                            sx={{ 
                                                width: 40, 
                                                height: 40,
                                                background: 'linear-gradient(45deg, #959AFF, #D89EFF)'
                                            }}
                                        >
                                            {selectedChat.name.charAt(0)}
                                        </Avatar>
                                        <Typography>{selectedChat.name}</Typography>
                                    </Box>
                                    <Divider orientation="horizontal" sx={{width: '90%', margin: '10px auto'}} />
                                </Box>
                                <Box 
                                    ref={messagesContainerRef}
                                    sx={{
                                        height: '400px',
                                        position: 'relative',
                                        backgroundColor: '#F6EFFF',
                                        padding: '20px',
                                        overflowY: 'auto',
                                        '&::-webkit-scrollbar': {
                                            width: '8px',
                                        },
                                        '&::-webkit-scrollbar-track': {
                                            background: '#F6EFFF',
                                        },
                                        '&::-webkit-scrollbar-thumb': {
                                            background: '#B689FF',
                                            borderRadius: '4px',
                                        },
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                >
                                    {selectedChat.messages.map(msg => (
                                        <motion.div
                                            key={msg.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, ease: "easeOut" }}
                                        >
                                            <Box sx={{
                                                backgroundColor: msg.senderId === auth.currentUser?.uid ? '#B689FF' : '#F6EFFF',
                                                padding: '12px',
                                                borderRadius: '20px',
                                                maxWidth: '45%',
                                                border: '1px solid #B689FF',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                                marginLeft: msg.senderId === auth.currentUser?.uid ? 'auto' : '0',
                                                marginRight: msg.senderId === auth.currentUser?.uid ? '0' : 'auto',
                                                marginBottom: '16px'
                                            }}>
                                                <Box sx={{ 
                                                    display: 'flex',
                                                    flexDirection: msg.senderId === auth.currentUser?.uid ? 'row-reverse' : 'row',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                }}>
                                                    <Avatar 
                                                        src={msg.senderAvatar} 
                                                        size="sm"
                                                        sx={{ 
                                                            width: 32, 
                                                            height: 32,
                                                            cursor: 'pointer'
                                                        }}
                                                        onClick={() => handleUserClick(msg.senderId)}
                                                    />
                                                    <Typography 
                                                        level="body-sm" 
                                                        sx={{ 
                                                            color: msg.senderId === auth.currentUser?.uid ? 'white' : TextColor,
                                                            cursor: 'pointer',
                                                            fontFamily: 'Montserrat',
                                                            fontSize: '12px',
                                                        }}
                                                        onClick={() => handleUserClick(msg.senderId)}
                                                    >
                                                        {msg.senderName}
                                                    </Typography>
                                                </Box>
                                                
                                                <Typography sx={{
                                                    color: msg.senderId === auth.currentUser?.uid ? 'white' : TextColor,
                                                    fontFamily: 'Montserrat',
                                                    fontSize: '14px',
                                                    lineHeight: '1.4',
                                                    marginLeft: msg.senderId === auth.currentUser?.uid ? '0' : '40px',
                                                    marginRight: msg.senderId === auth.currentUser?.uid ? '40px' : '0',
                                                }}>
                                                    {msg.text}
                                                </Typography>

                                                {msg.fileType === 'image' && (
                                                    <Box sx={{ mt: 1, mb: 1 }}>
                                                        <img 
                                                            src={msg.fileURL} 
                                                            alt={msg.fileName}
                                                            style={{
                                                                maxWidth: '100%',
                                                                maxHeight: '200px',
                                                                borderRadius: '8px',
                                                                cursor: 'pointer'
                                                            }}
                                                            onClick={() => window.open(msg.fileURL, '_blank')}
                                                        />
                                                    </Box>
                                                )}
                                                {msg.fileType === 'document' && (
                                                    <Box 
                                                        sx={{ 
                                                            mt: 1, 
                                                            mb: 1,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1,
                                                            cursor: 'pointer'
                                                        }}
                                                        onClick={() => window.open(msg.fileURL, '_blank')}
                                                    >
                                                        <InsertDriveFileIcon />
                                                        <Typography sx={{ fontSize: '12px', textDecoration: 'underline' }}>
                                                            {msg.fileName}
                                                        </Typography>
                                                    </Box>
                                                )}

                                                <Typography 
                                                    level="body-xs" 
                                                    sx={{ 
                                                        color: msg.senderId === auth.currentUser?.uid ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                                                        fontSize: '10px',
                                                        textAlign: msg.senderId === auth.currentUser?.uid ? 'right' : 'left',
                                                        fontFamily: 'Montserrat'
                                                    }}
                                                >
                                                    {new Date(msg.timestamp).toLocaleTimeString('ru-RU', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </Typography>
                                            </Box>
                                        </motion.div>
                                    ))}
                                </Box>
                            </Box>
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '10px',
                                backgroundColor: '#F6EFFF',
                                height: '83px',
                                padding: '0 20px',
                                borderRadius: '0 0 23px 23px'
                            }}>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            handleFileUpload(file);
                                        }
                                    }}
                                    accept="image/*,.pdf,.doc,.docx"
                                />
                                <IconButton
                                    onClick={() => fileInputRef.current?.click()}
                                    sx={{
                                        backgroundColor: '#B689FF',
                                        '&:hover': { backgroundColor: '#9137FF' }
                                    }}
                                >
                                    <AttachFileIcon sx={{ color: 'white' }} />
                                </IconButton>
                                <Input 
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder='Введите сообщение'
                                    sx={{
                                        flex: 1,
                                        backgroundColor: 'white',
                                        borderRadius: '20px',
                                        '& input': {
                                            padding: '8px 16px',
                                        }
                                    }}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            sendMessage();
                                        }
                                    }}
                                />
                                <Button 
                                    onClick={sendMessage}
                                    sx={{
                                        backgroundColor: '#B689FF',
                                        color: 'white',
                                        borderRadius: '100%',
                                        width: '50px',
                                        height: '50px',
                                        '&:hover': { backgroundColor: '#9137FF' }
                                    }}
                                >
                                    <SendIcon />
                                </Button>
                            </Box>
                        </Box>
                    )}
                </Box>
            </Box>

            <CreateChat 
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                friends={friends}
            />

            <Modal open={isAddMemberModalOpen} onClose={() => setIsAddMemberModalOpen(false)}>
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2
                }}>
                    <Typography>Добавить участников</Typography>
                    <List>
                        {friends
                            .filter(friend => !selectedChat?.members.includes(friend.uid!))
                            .map(friend => (
                                <ListItem key={friend.uid}>
                                    <Avatar src={friend.photoURL} />
                                    <Typography>{`${friend.name} ${friend.surname}`}</Typography>
                                    <Button onClick={() => addMember(friend.uid!)}>Добавить</Button>
                                    {selectedChat?.admins.includes(auth.currentUser?.uid || '') && (
                                        <IconButton onClick={() => makeAdmin(friend.uid!)}>
                                            <AdminPanelSettingsIcon />
                                        </IconButton>
                                    )}
                                </ListItem>
                            ))}
                    </List>
                </Box>
            </Modal>

            <ManageChat 
                isOpen={isManageChatOpen} 
                onClose={() => setIsManageChatOpen(false)}
                chat={selectedChat}
                friends={friends}
                onMemberRemove={removeMember}
                onMemberAdd={addMember}
                onMakeAdmin={makeAdmin}
                onRemoveAdmin={removeAdmin}
                onDeleteChat={deleteChat}
            />
        </Box>
    );
}

export default ChatList;
