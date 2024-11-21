import { useState, useEffect, useRef } from 'react';
import { Box, Button, Input } from '@mui/joy';
import { getAuth } from "firebase/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import Head from '../components/Head';
import { getStorage, uploadBytes, ref, getDownloadURL } from 'firebase/storage';
import { CircularProgress } from '@mui/joy';
import { motion } from 'framer-motion';


function EditProfile({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [photoURL, setPhotoURL] = useState('');
    const [uploading, setUploading] = useState(false);
    const [patronymic, setPatronymic] = useState('');
    const [course, setCourse] = useState('');
    const [college, setCollege] = useState('');
    const [job, setJob] = useState('');
    const [isTeacher, setIsTeacher] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const storage = getStorage();
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    const navigate = useNavigate();

    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !userId) return;

        setUploading(true);

        try {
            const fileExtension = file.name.split('.').pop();
            const fileName = `${userId}_${Date.now()}.${fileExtension}`;
            const storageRef = ref(storage, `userPhotos/${fileName}`);
            
            await uploadBytes(storageRef, file);
            
            const downloadURL = await getDownloadURL(storageRef);
            
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, {
                photoURL: downloadURL
            });
            
            setPhotoURL(downloadURL);
        } catch (error) {
            console.error('Ошибка при загрузке фото:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleSaveChanges = async () => {
        if (!userId) return;
        
        try {
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, {
                name: name.trim(),
                surname: surname.trim(),
                patronymic: patronymic.trim(),
                course: course,
                college: college,
                job: job,
            });
            onClose();
            navigate('/profile');
        } catch (error) {
            console.error('Ошибка при обновлении данных:', error);
        }
    };

    const handleTeacherStatus = async () => {
        if (!userId) return;
        
        try {
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, {
                isTeacher: !isTeacher
            });
            setIsTeacher(!isTeacher);
        } catch (error) {
            console.error('Ошибка при обновлении статуса преподавателя:', error);
        }
    };

    useEffect(() => {
        const loadUserData = async () => {
            if (!userId) return;
            
            try {
                const userDoc = await getDoc(doc(db, "users", userId));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setName(userData.name || '');
                    setSurname(userData.surname || '');
                    setPatronymic(userData.patronymic || '');
                    setCourse(userData.course || '');
                    setCollege(userData.college || '');
                    setJob(userData.job || '');
                    setPhotoURL(userData.photoURL || '');
                    setIsTeacher(userData.isTeacher || false);
                }
            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
            }
        };

        if (isOpen) {
            loadUserData();
        }
    }, [userId, isOpen]);

    if (!isOpen) return null;

    return (
        <>
            <motion.div
                onClick={onClose}
                initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                animate={{ opacity: 1, backdropFilter: 'blur(2px)' }}
                exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.15)',
                    zIndex: 900
                }}
            />
            <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut", type: "spring" }}
                style={{
                    position: 'fixed',
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    margin: 'auto',
                    width: '500px',
                    height: 'fit-content',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    background: 'linear-gradient(45deg, #e9d1ff, #eebdff)',
                    borderRadius: '20px',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                    zIndex: 1000,
                    padding: '30px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '20px',
                    maxWidth: '500px',
                    margin: '0 auto'
                }}>
                    <Box sx={{ 
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        bgcolor: '#E9D5FF',
                        marginBottom: '10px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        overflow: 'hidden',
                        position: 'relative'
                    }}>
                        {photoURL ? (
                            <img 
                                src={photoURL} 
                                alt="Фото профиля"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                        ) : (
                            <Box sx={{
                                width: '50%',
                                height: '50%',
                                bgcolor: '#9333EA',
                                borderRadius: '50%'
                            }} />
                        )}
                        {uploading && (
                            <Box sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                bgcolor: 'rgba(0, 0, 0, 0.5)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <CircularProgress 
                                    size="md"  
                                    variant="soft"
                                    sx={{ 
                                        '--CircularProgress-trackColor': 'transparent',
                                        '--CircularProgress-progressColor': 'linear-gradient(45deg, #8400FF, #FF00F6)',
                                        '& circle': {
                                            stroke: 'url(#gradient)'
                                        }
                                    }}
                                />
                                <svg width="0" height="0">
                                    <defs>
                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#8400FF" />
                                            <stop offset="100%" stopColor="#FF00F6" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </Box>
                        )}
                    </Box>
                    
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={handlePhotoUpload}
                    />
                    
                    <Button 
                        onClick={handleFileSelect}
                        disabled={uploading}
                        variant="plain"
                        sx={{ 
                            marginBottom: '20px', 
                            paddingInline: '10px', 
                            fontFamily: 'Montserrat', 
                            fontSize: '20px', 
                            background: 'linear-gradient(to left, #8400FF, #FF00F6)', 
                            '-webkit-background-clip': 'text', 
                            '-webkit-text-fill-color': 'transparent',
                            '&.Mui-disabled': {
                                opacity: 0.5
                            }
                        }}
                    >
                        {uploading ? 'Загрузка...' : 'Изменить фото'}
                    </Button>

                    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center'}}>
                        <Input 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder='Изменить имя'
                            slotProps={{
                                input: {
                                    style: {
                                        textAlign: 'center',
                                        fontFamily: 'Montserrat'
                                    }
                                }
                            }}
                            sx={{
                                width: '380px', 
                                height: '50px',
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
                                    borderRadius: '60px',
                                    border: '2px solid transparent',
                                    background: 'linear-gradient(45deg, #8400FF, #FF00F6) border-box',
                                    WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                                    WebkitMaskComposite: 'destination-out',
                                    maskComposite: 'exclude'
                                }
                            }}
                        />
                        <Input 
                            value={surname}
                            onChange={(e) => setSurname(e.target.value)}
                            placeholder='Фамилия'
                            slotProps={{
                                input: {
                                    style: {
                                        textAlign: 'center',
                                        fontFamily: 'Montserrat'
                                    }
                                }
                            }}
                            sx={{
                                width: '380px', 
                                height: '50px',
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
                                    borderRadius: '60px',
                                    border: '2px solid transparent',
                                    background: 'linear-gradient(45deg, #8400FF, #FF00F6) border-box',
                                    WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                                    WebkitMaskComposite: 'destination-out',
                                    maskComposite: 'exclude'
                                }
                            }}
                        />
                        <Input 
                            value={patronymic}
                            onChange={(e) => setPatronymic(e.target.value)}
                            placeholder='Отчество'
                            slotProps={{
                                input: {
                                    style: {
                                        textAlign: 'center',
                                        fontFamily: 'Montserrat'
                                    }
                                }
                            }}
                            sx={{
                                width: '380px', 
                                height: '50px',
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
                                    borderRadius: '60px',
                                    border: '2px solid transparent',
                                    background: 'linear-gradient(45deg, #8400FF, #FF00F6) border-box',
                                    WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                                    WebkitMaskComposite: 'destination-out',
                                    maskComposite: 'exclude'
                                }
                            }}
                        />
                        <Input 
                            value={college} 
                            onChange={(e) => setCollege(e.target.value)}
                            placeholder="Наименование колледжа" 
                            slotProps={{
                                input: {
                                    style: {
                                        textAlign: 'center',
                                        fontFamily: 'Montserrat'
                                    }
                                }
                            }}
                            sx={{
                            width: '380px', 
                            height: '50px',
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
                                borderRadius: '60px',
                                border: '2px solid transparent',
                                background: 'linear-gradient(45deg, #8400FF, #FF00F6) border-box',
                                WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                                WebkitMaskComposite: 'destination-out',
                                maskComposite: 'exclude'
                            }
                        }} />
                        <Box sx={{ 
                            width: '380px',
                            height: '50px',
                            position: 'relative'
                        }}>
                            <select
                                value={course}
                                onChange={(e) => setCourse(e.target.value)}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    padding: '15px 20px',
                                    outline: 'none',
                                    fontSize: '16px',
                                    fontFamily: 'Montserrat',
                                    textAlign: 'center',
                                    appearance: 'none',
                                    border: 'none',
                                    backgroundColor: 'transparent',
                                    position: 'relative',
                                    zIndex: 2,
                                    cursor: 'pointer',
                                    color: '#000'
                                }}
                            >
                                <option value="" disabled>Выберите курс</option>
                                <option value="1">1 курс</option>
                                <option value="2">2 курс</option>
                                <option value="3">3 курс</option>
                                <option value="4">4 курс</option>
                                <option value="5">5 курс</option>
                            </select>
                            <Box sx={{
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                borderRadius: '60px',
                                border: '2px solid transparent',
                                background: 'linear-gradient(45deg, #8400FF, #FF00F6) border-box',
                                WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                                WebkitMaskComposite: 'destination-out',
                                maskComposite: 'exclude',
                                pointerEvents: 'none'
                            }} />
                        </Box>
                        <Input 
                            value={job} 
                            onChange={(e) => setJob(e.target.value)}
                            placeholder="Сециальность" 
                            slotProps={{
                                input: {
                                    style: {
                                        textAlign: 'center',
                                        fontFamily: 'Montserrat'
                                    }
                                }
                            }}
                            sx={{
                                width: '380px', 
                                height: '50px',
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
                                    borderRadius: '60px',
                                    border: '2px solid transparent',
                                    background: 'linear-gradient(45deg, #8400FF, #FF00F6) border-box',
                                    WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                                    WebkitMaskComposite: 'destination-out',
                                    maskComposite: 'exclude'
                                }
                        }} />
                    </Box>

                    <Button
                        onClick={handleSaveChanges}
                        sx={{
                            fontFamily: 'Montserrat',
                            fontSize: '16px',
                            width: '380px',
                            height: '50px',
                            marginTop: '20px',
                            borderRadius: '60px',
                            background: 'linear-gradient(45deg, #8400FF, #FF00F6)',
                            color: 'white',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #7300DE, #E100D5)',
                            }
                        }}
                    >
                        Сохранить изменения
                    </Button>

                    <Button 
                        onClick={handleTeacherStatus}
                        variant="plain"
                        sx={{ 
                            marginTop: '20px',
                            paddingInline: '10px', 
                            fontFamily: 'Montserrat', 
                            fontSize: '20px', 
                            background: 'linear-gradient(to left, #8400FF, #FF00F6)', 
                            '-webkit-background-clip': 'text', 
                            '-webkit-text-fill-color': 'transparent',
                        }}
                    >
                        {isTeacher ? 'Я не преподаватель' : 'Я преподаватель'}
                    </Button>
                </Box>
            </motion.div>
        </>
    );
}

export default EditProfile;