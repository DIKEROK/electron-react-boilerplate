import { Box, Typography } from "@mui/joy";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../../assets/images/Logo_without_text.svg"

const TextColor = '#3C007D'

function Head() {
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState('');
    const [currentDay, setCurrentDay] = useState('');

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
    )
}

export default Head;
