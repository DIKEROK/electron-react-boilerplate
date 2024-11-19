import { useState, useEffect } from 'react';
import { Box, Button, Input, Textarea, Typography } from '@mui/joy';
import { motion } from 'framer-motion';
import "@fontsource/jockey-one/400.css";
import "@fontsource/montserrat";
import icon from "../../../assets/icon.svg"
import human_1 from "../../../assets/images/About_Human_1.png"
import human_2 from "../../../assets/images/About_Human_2.png"
import human_3 from "../../../assets/images/About_Human_3.png"
import human_4 from "../../../assets/images/About_Human_4.png"
import logo from "../../../assets/images/Logo_without_text.svg"
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from '../firebase';
import { useNavigate } from 'react-router-dom';

const TextColor = '#3C007D'

function About() {
    const [currentTime, setCurrentTime] = useState('');
    const [currentDay, setCurrentDay] = useState('');
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
                    <Box onClick={() => navigate('/')} sx={{display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexDirection: 'row', flex: 1, cursor:'pointer'}}>
                        <img src={logo} alt="logo" style={{width: '30px', height: '30px', marginRight: '-3px'}} />
                        <Typography level="h2" sx={{fontFamily: "Jockey One", letterSpacing: '2px', fontSize: '34px', color: TextColor}} >STUDYTALK</Typography>
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
                    <Typography level="h2" sx={{fontFamily: "Montserrat", fontSize: '28px', color: TextColor}}>STUDYTALK – социальная сеть для студентов</Typography>
                    <Typography level="h2" sx={{fontFamily: "Montserrat", fontSize: '28px', color: TextColor}}>создана специально для того, чтобы</Typography>
                    <Typography level="h2" sx={{fontFamily: "Montserrat", fontSize: '28px', color: TextColor}}>объединить студентов со всего мира и сделать</Typography>
                    <Typography level="h2" sx={{fontFamily: "Montserrat", fontSize: '28px', color: TextColor}}>процесс обучения более эффективным и</Typography>
                    <Typography level="h2" sx={{fontFamily: "Montserrat", fontSize: '28px', color: TextColor}}>увлекательным. В этой уникальной платформе</Typography>
                    <Typography level="h2" sx={{fontFamily: "Montserrat", fontSize: '28px', color: TextColor}}>студенты могут делиться своими знаниями,</Typography>
                    <Typography level="h2" sx={{fontFamily: "Montserrat", fontSize: '28px', color: TextColor}}>опытом и находить ответы на любые вопросы,</Typography>
                    <Typography level="h2" sx={{fontFamily: "Montserrat", fontSize: '28px', color: TextColor}}>связанные с учебой.</Typography>
                </Box>
                <Box sx={{position: 'relative', overflow: 'hidden', width: '500px'}}>
                    <motion.img src={human_1} alt="" style={{overflow: 'hidden', objectFit: 'contain', width: '100%', height: '100%'}} initial={{x: 100, opacity: 0}} transition={{duration:1, ease: "linear"}} whileInView={{x: 0, opacity: 1}} />
                </Box>
            </Box>

            <Box sx={{paddingTop: '50px', justifyContent: 'space-around', display: 'flex', alignItems: 'center'}}>
                <Box sx={{position: 'relative', overflow: 'hidden', width: '380px'}}>
                    <motion.img src={human_2} alt="" style={{overflow: 'hidden', objectFit: 'contain', width: '100%', height: '100%'}} initial={{x: -100, opacity: 0}} transition={{duration:1, ease: "linear"}} whileInView={{x: 0, opacity: 1}} />
                </Box>
                <Box sx={{display: 'flex', alignItems: 'flex-end', justifyContent: 'center', flexDirection: 'column'}}>
                    <Typography level="h3" sx={{fontFamily: "Montserrat", fontSize: '28px', color: TextColor}}>Обмен знаниями: Студенты могут публиковать</Typography>
                    <Typography level="h3" sx={{fontFamily: "Montserrat", fontSize: '28px', color: TextColor}}>свои учебные материалы, конспекты лекций,</Typography>
                    <Typography level="h3" sx={{fontFamily: "Montserrat", fontSize: '28px', color: TextColor}}>рефераты и курсовые работы, а также получать</Typography>
                    <Typography level="h3" sx={{fontFamily: "Montserrat", fontSize: '28px', color: TextColor}}>доступ к материалам других участников</Typography>
                    <Typography level="h3" sx={{fontFamily: "Montserrat", fontSize: '28px', color: TextColor}}>сообщества. Это помогает расширить кругозор</Typography>
                    <Typography level="h3" sx={{fontFamily: "Montserrat", fontSize: '28px', color: TextColor}}>и глубже понять изучаемые предметы.</Typography>
                </Box>
            </Box>

            <Box sx={{paddingTop: '50px', justifyContent: 'space-around', display: 'flex', alignItems: 'center'}}>
                <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                    <Typography level="h2" sx={{fontFamily: "Montserrat", fontSize: '28px', color: TextColor}}>Совместное обучение: В</Typography>
                    <Typography level="h2" sx={{fontFamily: "Montserrat", fontSize: '28px', color: TextColor}}>STUDYTALK можно создавать</Typography>
                    <Typography level="h2" sx={{fontFamily: "Montserrat", fontSize: '28px', color: TextColor}}>группы по интересам, где</Typography>
                    <Typography level="h2" sx={{fontFamily: "Montserrat", fontSize: '28px', color: TextColor}}>участники обсуждают сложные</Typography>
                    <Typography level="h2" sx={{fontFamily: "Montserrat", fontSize: '28px', color: TextColor}}>темы, решают задачи вместе и</Typography>
                    <Typography level="h2" sx={{fontFamily: "Montserrat", fontSize: '28px', color: TextColor}}>помогают друг другу в подготовке</Typography>
                    <Typography level="h2" sx={{fontFamily: "Montserrat", fontSize: '28px', color: TextColor}}>к экзаменам.</Typography>
                </Box>
                <Box sx={{position: 'relative', overflow: 'hidden', width: '680px'}}>
                    <motion.img src={human_3} alt="" style={{overflow: 'hidden', objectFit: 'contain', width: '100%', height: '100%'}} initial={{x: 100, opacity: 0}} transition={{duration:1, ease: "linear"}} whileInView={{x: 0, opacity: 1}} />
                </Box>
            </Box>
            
            <Box sx={{paddingTop: '50px', justifyContent: 'space-around', display: 'flex', alignItems: 'center'}}>
                <Box sx={{position: 'relative', overflow: 'hidden', width: '380px'}}>
                    <motion.img src={human_4} alt="" style={{overflow: 'hidden', objectFit: 'contain', width: '100%', height: '100%'}} initial={{x: -100, opacity: 0}} transition={{duration:1, ease: "linear"}} whileInView={{x: 0, opacity: 1}} />
                </Box>
                <Box sx={{display: 'flex', alignItems: 'flex-end', justifyContent: 'center', flexDirection: 'column'}}>
                    <Typography level="h3" sx={{fontFamily: "Montserrat", fontSize: '28px', color: TextColor}}>Доступность ресурсов: STUDYTALK предлагает </Typography>
                    <Typography level="h3" sx={{fontFamily: "Montserrat", fontSize: '28px', color: TextColor}}>удобный поиск учебных материалов, книг, </Typography>
                    <Typography level="h3" sx={{fontFamily: "Montserrat", fontSize: '28px', color: TextColor}}>статей и видеоуроков, что значительно</Typography>
                    <Typography level="h3" sx={{fontFamily: "Montserrat", fontSize: '28px', color: TextColor}}>упрощает подготовку к занятиям и</Typography>
                    <Typography level="h3" sx={{fontFamily: "Montserrat", fontSize: '28px', color: TextColor}}>самостоятельной работе.</Typography>
                </Box>
            </Box>

        </Box>
    )
}

export default About;
