import { Box, Button, Input, Typography } from '@mui/joy';
import { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { app } from '../firebase';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const TextColor = '#3C007D'

function Registration() {
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [patronymic, setPatronymic] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    
    const navigate = useNavigate();
    const auth = getAuth(app);
    const db = getFirestore(app);

    const handleRegistration = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setError('Пароли не совпадают');
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await updateProfile(user, {
                displayName: `${name} ${surname}`
            });

            await setDoc(doc(db, "users", user.uid), {
                name,
                surname,
                patronymic,
                email,
                createdAt: new Date().toISOString()
            });

            console.log('Пользователь успешно зарегистрирован');
            navigate('/chat');
        } catch (error: any) {
            let errorMessage = 'Произошла ошибка при регистрации';
            
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'Этот email уже используется';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Некорректный email';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Слишком слабый пароль';
                    break;
                default:
                    errorMessage = error.message;
            }
            
            setError(errorMessage);
        }
    };

    return (
        <motion.div initial={{opacity: 0, scale: 0.8}} animate={{opacity: 1, scale: 1}} exit={{opacity: 0, scale: 0.8}} transition={{duration: 0.6, type: "spring", ease: "linear"}}>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                paddingTop: '40px',
                paddingBottom: '20px'
            }}>
                <Typography level="h2" sx={{fontFamily: "Montserrat", letterSpacing: '2px', fontSize: '34px', color: TextColor}}>Регистрация</Typography>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    alignItems:'center',
                    paddingTop:'10px',
                }}>
                    <Input 
                        value={name}
                        type='text'
                        onChange={(e) => setName(e.target.value)}
                        placeholder='Введите имя'
                        slotProps={{
                            input: {
                                style: {
                                    textAlign: 'center',
                                    fontFamily: 'Montserrat'
                                }
                            }
                        }}
                        sx={{
                            width: '300px', 
                            height: '70px',
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
                                borderRadius: '60px',
                                border: '2px solid transparent',
                                background: 'linear-gradient(45deg, #8400FF, #FF00F6) border-box',
                                WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                                WebkitMaskComposite: 'destination-out',
                                maskComposite: 'exclude'
                            }
                        }}
                    />
                    <Input value={surname} type='text' onChange={(e) => setSurname(e.target.value)} placeholder='Введите фамилию' slotProps={{
                            input: {
                                style: {
                                    textAlign: 'center',
                                    fontFamily: 'Montserrat'
                                }
                            }
                        }}
                        sx={{
                            width: '300px', 
                            height: '70px',
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
                                borderRadius: '60px',
                                border: '2px solid transparent',
                                background: 'linear-gradient(45deg, #8400FF, #FF00F6) border-box',
                                WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                                WebkitMaskComposite: 'destination-out',
                                maskComposite: 'exclude'
                            }
                        }}
                    />
                    <Input placeholder='Введите отчество' type='text' value={patronymic} onChange={(e) => setPatronymic(e.target.value)} slotProps={{
                            input: {
                                style: {
                                    textAlign: 'center',
                                    fontFamily: 'Montserrat'
                                }
                            }
                        }}
                        sx={{
                            width: '300px', 
                            height: '70px',
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
                                borderRadius: '60px',
                                border: '2px solid transparent',
                                background: 'linear-gradient(45deg, #8400FF, #FF00F6) border-box',
                                WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                                WebkitMaskComposite: 'destination-out',
                                maskComposite: 'exclude'
                            }
                        }}
                    />
                    <Input placeholder='Введите почту' type='email' value={email} onChange={(e) => setEmail(e.target.value)} slotProps={{
                            input: {
                                style: {
                                    textAlign: 'center',
                                    fontFamily: 'Montserrat'
                                }
                            }
                        }}
                        sx={{
                            width: '300px', 
                            height: '70px',
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
                                borderRadius: '60px',
                                border: '2px solid transparent',
                                background: 'linear-gradient(45deg, #8400FF, #FF00F6) border-box',
                                WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                                WebkitMaskComposite: 'destination-out',
                                maskComposite: 'exclude'
                            }
                        }}
                    />
                    <Input placeholder='Введите пароль' type='password' value={password} onChange={(e) => setPassword(e.target.value)} slotProps={{
                            input: {
                                style: {
                                    textAlign: 'center',
                                    fontFamily: 'Montserrat'
                                }
                            }
                        }}
                        sx={{
                            width: '300px', 
                            height: '70px',
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
                                borderRadius: '60px',
                                border: '2px solid transparent',
                                background: 'linear-gradient(45deg, #8400FF, #FF00F6) border-box',
                                WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                                WebkitMaskComposite: 'destination-out',
                                maskComposite: 'exclude'
                            }
                        }}
                    />
                    <Input placeholder='Подтвердите пароль' type='password' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} slotProps={{
                            input: {
                                style: {
                                    textAlign: 'center',
                                    fontFamily: 'Montserrat'
                                }
                            }
                        }}
                        sx={{
                            width: '300px', 
                            height: '70px',
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
                                borderRadius: '60px',
                                border: '2px solid transparent',
                                background: 'linear-gradient(45deg, #8400FF, #FF00F6) border-box',
                                WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                                WebkitMaskComposite: 'destination-out',
                                maskComposite: 'exclude'
                            }
                        }}
                    />
                    <Button 
                        onClick={handleRegistration}
                        sx={{
                            fontFamily: 'Montserrat', 
                            background: 'linear-gradient(to left, #8400FF, #FF00F6)',
                            borderRadius: '30px',
                            width: '200px',
                            height: '50px',
                        }}
                    >
                        Регистрация
                    </Button>
                </Box>
            </Box>
            {error && (
                <Typography 
                    level="body-sm" 
                    sx={{color: 'red', fontFamily: "Montserrat"}}>
                    {error}
                </Typography>
            )}
            <Box sx={{display: 'flex', alignItems: 'baseline', justifyContent:'center'}}>
                    <Typography level="h3" sx={{fontFamily: "Montserrat", fontSize: '20px', color: TextColor}}>Есть аккаунт?</Typography>
                    <Button sx={{ marginBottom: '20px', paddingInline: '10px', fontFamily: 'Montserrat', fontSize: '20px', background: 'linear-gradient(to left, #8400FF, #FF00F6)', '-webkit-background-clip': 'text', '-webkit-text-fill-color': 'transparent'}} onClick={() => navigate('/')}>На главную</Button>
            </Box>
        </motion.div>
    )
}

export default Registration;
