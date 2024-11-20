import { useState } from 'react';
import { Box, Button, Textarea, Typography } from '@mui/joy';
import { motion } from 'framer-motion';
import human_4 from "../../../assets/images/Login_Human_4.png";

const token = "6246917267:AAFApggFn6VlsZ_w8e5YwIt-SdVwb6XaUyE";
const chatIds = ['965614231', '1044229010', '809573800'];
const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;

function Feedback({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [feedback, setFeedback] = useState('');

    const sendFeedback = async (text: string) => {
        for (const chatId of chatIds) {
            try {
                const response = await fetch(telegramUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        chat_id: chatId,
                        text: `Новая обратная связь:\n${text}`,
                    }),
                });
                
                if (!response.ok) {
                    throw new Error('Ошибка отправки сообщения');
                }
            } catch (error) {
                console.error('Ошибка при отправке в Telegram:', error);
            }
        }
        onClose();
    };

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
                <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
                    <Box sx={{position: 'relative', overflow: 'hidden', width: '300px'}}>
                        <motion.img 
                            src={human_4} 
                            alt="" 
                            style={{overflow: 'hidden', objectFit: 'contain', width: '100%', height: '100%'}} 
                            initial={{scale: 0, opacity: 0}} 
                            animate={{scale: 1, opacity: 1}}
                            transition={{duration:1, type: "spring", ease: "linear"}} 
                        />
                    </Box>
                    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
                        <Typography level="h1" sx={{fontFamily: "Montserrat", fontSize: '40px', color: '#3C007D'}}>Обратная связь</Typography>
                        <Typography level="h3" sx={{fontFamily: "Montserrat", fontSize: '22px', color: '#3C007D'}}>Мы хотим знать, как вам</Typography>
                        <Typography level="h3" sx={{fontFamily: "Montserrat", fontSize: '22px', color: '#3C007D'}}>наше приложение, оставьте</Typography>
                        <Typography level="h3" sx={{fontFamily: "Montserrat", fontSize: '22px', color: '#3C007D'}}>обратную связь!</Typography>
                        <Textarea 
                            placeholder='Напишите ваше мнение' 
                            onChange={(e) => setFeedback(e.target.value)} 
                            slotProps={{
                                textarea: {
                                    style: {
                                        textAlign: 'center', 
                                        fontFamily: 'Montserrat', 
                                        fontSize: '20px'
                                    }
                                }
                            }} 
                            sx={{
                                width: '450px', 
                                height: '100px',
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
                        <Button 
                            onClick={() => sendFeedback(feedback)} 
                            sx={{
                                width: '350px', 
                                fontFamily: 'Montserrat', 
                                height: '60px', 
                                marginTop: '20px', 
                                marginBottom: '20px', 
                                borderRadius: '60px', 
                                fontSize: '20px', 
                                background: 'linear-gradient(to left, #8400FF, #FF00F6)'
                            }}
                        >
                            Отправить
                        </Button>
                    </Box>
                </Box>
            </motion.div>
        </>
    );
}

export default Feedback;

