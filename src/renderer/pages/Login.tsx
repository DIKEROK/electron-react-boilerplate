import { useState, useEffect } from 'react';
import { Box, Button, Input, Textarea, Typography } from '@mui/joy';
import { motion } from 'framer-motion';
import "@fontsource/jockey-one/400.css";
import "@fontsource/montserrat";
import icon from "../../../assets/icon.svg"
import human_1 from "../../../assets/images/Login_Human_1.png"
import human_2 from "../../../assets/images/Login_Human_2.png"
import human_3 from "../../../assets/images/Login_Human_3.png"
import human_4 from "../../../assets/images/Login_Human_4.png"
import logo from "../../../assets/images/Logo_without_text.svg"
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from '../firebase';
import { useNavigate } from 'react-router-dom';

const TextColor = '#3C007D'

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [currentTime, setCurrentTime] = useState('');
    const [currentDay, setCurrentDay] = useState('');
    
    const auth = getAuth(app);

    const navigate = useNavigate();

    useEffect(() => {
        const updateDateTime = () => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            
            const days = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
            
            setCurrentTime(`${hours}:${minutes}`);
            setCurrentDay(days[now.getDay()]);
        };

        updateDateTime();
        const interval = setInterval(updateDateTime, 1000);

        return () => clearInterval(interval);
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log('Успешная авторизация:', user);
        } catch (error: any) {
            setError('Ошибка авторизации: ' + error.message);
        }
    };

    return (
        <Box>
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginTop: '50px'}}>
                <Box sx={{
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    flexDirection: 'row', 
                    marginTop: '20px', 
                    width: '100%', 
                    height: '100px',
                    background: 'linear-gradient(to left, rgba(132, 0, 255, 0.05), rgba(255, 0, 246, 0.05))',
                    backdropFilter: "blur(10px)",
                    borderRadius: '30px',
                    boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.1)',
                    paddingLeft: '50px',
                    paddingRight: '50px',
                    position: 'relative'
                }}>
                    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexDirection: 'row', flex: 1}}>
                        <img src={logo} alt="logo" style={{width: '30px', height: '30px', marginRight: '-3px'}} />
                        <Typography level="h2" sx={{fontFamily: "Jockey One", letterSpacing: '2px', fontSize: '34px', color: TextColor}}>STUDYTALK</Typography>
                    </Box>
                    <Box sx={{
                        position: 'absolute',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Typography level="h2" sx={{fontFamily: "Montserrat", fontSize: '24px', color: TextColor}}>{currentTime}</Typography>
                        <Typography level="h2" sx={{fontFamily: "Montserrat", fontSize: '24px', color: TextColor}}>{currentDay}</Typography>
                    </Box>
                    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flexDirection: 'row', flex: 1}}>
                        <Typography level="h2" sx={{fontFamily: "Montserrat", fontSize: '24px', color: TextColor}}>Выход</Typography>
                    </Box>
                </Box>
            </Box>
            <Box sx={{paddingTop: '50px', justifyContent: 'space-around', display: 'flex', alignItems: 'center'}}>
                <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                    <Typography level="h1" sx={{fontFamily: "Jockey One", fontSize: '96px', color: TextColor, letterSpacing: '10px'}}>STUDYTALK</Typography>
                    <Typography level="h2" sx={{fontFamily: "Montserrat", fontSize: '32px', color: TextColor}}>Один из лучших мессенджеров для общения</Typography>
                    <Typography level="h2" sx={{fontFamily: "Montserrat", fontSize: '32px', color: TextColor}}>студентов между собой!</Typography>
                    <Typography level="h3" sx={{fontFamily: "Montserrat", fontSize: '32px', color: TextColor}}>• Удобство общения</Typography>
                    <Typography level="h3" sx={{fontFamily: "Montserrat", fontSize: '32px', color: TextColor}}>• Обмен опытом</Typography>
                    <Typography level="h3" sx={{fontFamily: "Montserrat", fontSize: '32px', color: TextColor}}>• Посещение ивентов в разных колледжах</Typography>
                    <Typography level="h3" sx={{fontFamily: "Montserrat", fontSize: '32px', color: TextColor}}>• Удобный способ социализации студентов</Typography>
                </Box>
                <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    <img src={icon} alt="icon"  />
                    <Typography level="h2" sx={{fontFamily: "Montserrat", fontSize: '24px', color: TextColor}}>Стань частью чего-то</Typography>
                    <Typography level="h2" sx={{fontFamily: "Montserrat", fontSize: '24px', color: TextColor, marginBottom: '20px'}}>большего вместе с нами!</Typography>
                    <Input 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder='Введите почту'
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
                    <Input 
                        value={password}
                        type="password"
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder='Введите пароль'
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
                    <Button 
                        onClick={handleLogin}
                        sx={{width: '200px', fontFamily: 'Montserrat', height: '60px', marginBottom: '20px', borderRadius: '60px', fontSize: '20px', background: 'linear-gradient(to left, #8400FF, #FF00F6)'}}>
                        Вход
                    </Button>
                    {error && (
                        <Typography 
                            level="body-sm" 
                            sx={{color: 'red', fontFamily: "Montserrat"}}>
                            {error}
                        </Typography>
                    )}
                    <Box sx={{display: 'flex', alignItems: 'baseline'}}>
                        <Typography level="h3" sx={{fontFamily: "Montserrat", fontSize: '20px', color: TextColor}}>Нет аккаунта?</Typography>
                        <Button sx={{ marginBottom: '20px', paddingInline: '10px', fontFamily: 'Montserrat', fontSize: '20px', background: 'linear-gradient(to left, #8400FF, #FF00F6)', '-webkit-background-clip': 'text', '-webkit-text-fill-color': 'transparent'}} onClick={() => navigate('/regestration')}>Зарегистрироваться</Button>
                    </Box>
                </Box>
            </Box>
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', marginTop: '100px'}}>
                <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'center', flexDirection: 'column'}}>
                    <Typography level="h1" sx={{fontFamily: "Montserrat", fontSize: '72px', color: TextColor}}>О нас</Typography>
                    <Typography level="h3" sx={{fontFamily: "Montserrat", fontSize: '32px', color: TextColor}}>Помогает студентам со</Typography>
                    <Typography level="h3" sx={{fontFamily: "Montserrat", fontSize: '32px', color: TextColor}}>всех уголков России</Typography>
                    <Typography level="h3" sx={{fontFamily: "Montserrat", fontSize: '32px', color: TextColor}}>сделать студенческую</Typography>
                    <Typography level="h3" sx={{fontFamily: "Montserrat", fontSize: '32px', color: TextColor}}>жизнь проще и</Typography>
                    <Typography level="h3" sx={{fontFamily: "Montserrat", fontSize: '32px', color: TextColor}}>интереснее!</Typography>
                    <Button 
                        onClick={() => navigate('/about')}
                        sx={{width: '350px', fontFamily: 'Montserrat', height: '60px', marginTop: '20px', borderRadius: '60px', fontSize: '20px', background: 'linear-gradient(to left, #8400FF, #FF00F6)'}}>
                        Узнать больше
                    </Button>
                </Box>
                <Box sx={{position: 'relative', overflow: 'hidden', width: '650px'}}>
                    <motion.img src={human_1} alt="" style={{overflow: 'hidden', objectFit: 'contain', width: '100%', height: '100%'}} initial={{x: 100, opacity: 0}} transition={{duration:1, ease: "linear"}} whileInView={{x: 0, opacity: 1}} />
                </Box>
            </Box>
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginTop: '100px'}}>
                <Box sx={{position: 'relative', overflow: 'hidden', width: '650px'}}>
                    <motion.img src={human_2} alt="" style={{overflow: 'hidden', objectFit: 'contain', width: '100%', height: '100%'}} initial={{x: -100, opacity: 0}} transition={{duration:1, ease: "linear"}} whileInView={{x: 0, opacity: 1}} />
                </Box>
                <Box sx={{display: 'flex', alignItems: 'flex-end', justifyContent: 'center', flexDirection: 'column'}}>
                    <Typography level="h1" sx={{fontFamily: "Montserrat", fontSize: '72px', color: TextColor}}>Помощь</Typography>
                    <Typography level="h3" sx={{fontFamily: "Montserrat", fontSize: '32px', color: TextColor}}>Помогаем студентам со всей</Typography>
                    <Typography level="h3" sx={{fontFamily: "Montserrat", fontSize: '32px', color: TextColor}}>страны решать личные</Typography>
                    <Typography level="h3" sx={{fontFamily: "Montserrat", fontSize: '32px', color: TextColor}}>проблемы и учебные, а также</Typography>
                    <Typography level="h3" sx={{fontFamily: "Montserrat", fontSize: '32px', color: TextColor}}>помогать в написании научных</Typography>
                    <Typography level="h3" sx={{fontFamily: "Montserrat", fontSize: '32px', color: TextColor}}>работ!</Typography>
                    <Button 
                        sx={{width: '350px', fontFamily: 'Montserrat', height: '60px', marginTop: '20px', borderRadius: '60px', fontSize: '20px', background: 'linear-gradient(to left, #8400FF, #FF00F6)'}}>
                        Начать прямо сейчас!
                    </Button>
                </Box>
            </Box>
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginTop: '100px'}}>
                <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'center', flexDirection: 'column'}}>
                    <Typography level="h1" sx={{fontFamily: "Montserrat", fontSize: '72px', color: TextColor}}>Мессенджер</Typography>
                    <Typography level="h3" sx={{fontFamily: "Montserrat", fontSize: '32px', color: TextColor}}>Удобный мессенджер для</Typography>
                    <Typography level="h3" sx={{fontFamily: "Montserrat", fontSize: '32px', color: TextColor}}>общения со студентами,</Typography>
                    <Typography level="h3" sx={{fontFamily: "Montserrat", fontSize: '32px', color: TextColor}}>большой функционал для</Typography>
                    <Typography level="h3" sx={{fontFamily: "Montserrat", fontSize: '32px', color: TextColor}}>быстрого обмена необходимой</Typography>
                    <Typography level="h3" sx={{fontFamily: "Montserrat", fontSize: '32px', color: TextColor}}>информации!</Typography>
                    <Button 
                        sx={{width: '350px', fontFamily: 'Montserrat', height: '60px', marginTop: '20px', borderRadius: '60px', fontSize: '20px', background: 'linear-gradient(to left, #8400FF, #FF00F6)'}}>
                        Начать прямо сейчас!
                    </Button>
                </Box>
                <Box sx={{position: 'relative', overflow: 'hidden', width: '650px'}}>
                    <motion.img src={human_3} alt="" style={{overflow: 'hidden', objectFit: 'contain', width: '100%', height: '100%'}} initial={{x: 100, opacity: 0}} transition={{duration:1, ease: "linear"}} whileInView={{x: 0, opacity: 1}} />
                </Box>
            </Box>
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', marginTop: '100px'}}>
                <Box sx={{position: 'relative', overflow: 'hidden', width: '300px'}}>
                    <motion.img src={human_4} alt="" style={{overflow: 'hidden', objectFit: 'contain', width: '100%', height: '100%'}} initial={{scale: 0, opacity: 0}} transition={{duration:1, ease: "linear"}} whileInView={{scale: 1, opacity: 1}} />
                </Box>
                <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
                    <Typography level="h1" sx={{fontFamily: "Montserrat", fontSize: '60px', color: TextColor}}>Обратная связь</Typography>
                    <Typography level="h3" sx={{fontFamily: "Montserrat", fontSize: '28px', color: TextColor}}>Мы хотим знать, как вам</Typography>
                    <Typography level="h3" sx={{fontFamily: "Montserrat", fontSize: '28px', color: TextColor}}>наше приложение, оставьте</Typography>
                    <Typography level="h3" sx={{fontFamily: "Montserrat", fontSize: '28px', color: TextColor}}>обратную связь!</Typography>
                    <Textarea placeholder='Напишите ваше мнение' slotProps={{textarea: {style: {textAlign: 'center', fontFamily: 'Montserrat', fontSize: '20px'}}}} sx={{
                            width: '450px', 
                            height: '150px',
                            marginTop: '20px',
                            position: 'relative',
                            padding: '15px 20px',
                            boxShadow: 'none',
                            borderColor: 'rgba(225, 0, 0, 0)',
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
                    <Button sx={{width: '350px', fontFamily: 'Montserrat', height: '60px', marginTop: '20px', marginBottom: '100px', borderRadius: '60px', fontSize: '20px', background: 'linear-gradient(to left, #8400FF, #FF00F6)'}}>Отправить</Button>
                </Box>
            </Box>
        </Box>
    );
}

export default Login;

