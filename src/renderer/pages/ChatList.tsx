import { Box, Button, Input, Typography } from '@mui/joy';
import { getAuth, signOut } from "firebase/auth";
import { app } from '../firebase';
import Head from "../components/Head";
import { useState } from 'react';

const TextColor = '#3C007D'

function ChatList() {

    const [message, setMessage] = useState('')

    return (
        <Box>
            <Box sx={{display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '50px'}}>
                <Head />
            </Box>
            <Box>
                <Box sx={{display:'flex', gap:'20px'}}>
                    <Box>
                        <Box sx={{
                                    width: '277px', 
                                    height: '500px',
                                    position: 'relative',
                                    boxShadow: 'none',
                                    borderColor: 'rgba(0, 0, 0, 0)',
                                    backgroundColor: '#F6EFFF', 
                                    borderRadius: '23px',
                                }}>
                        </Box>
                        <Box sx={{
                            width: '277px', 
                            height: '63px',
                            position: 'relative',
                            boxShadow: 'none',
                            borderColor: 'rgba(0, 0, 0, 0)',
                            backgroundColor: '#F6EFFF', 
                            borderRadius: '23px',
                            marginTop: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                borderRadius: '23px',
                                border: '2px solid transparent',
                                background: 'linear-gradient(45deg, #8400FF, #FF00F6) border-box',
                                WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                                WebkitMaskComposite: 'destination-out',
                                maskComposite: 'exclude'
                            }
                        }}>
                            <Box sx={{
                                width: '37px', 
                                height: '37px',
                                background: 'linear-gradient(to left, #B689FF, #9137FF)',
                                borderRadius: '100%',
                                marginLeft: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <Typography sx={{
                                    color: 'white',
                                    fontFamily: 'Montserrat',
                                    fontSize: '24px',
                                }}>
                                    +
                                </Typography>
                            </Box>
                            <Typography sx={{
                                color: {TextColor},
                                fontFamily: 'Montserrat',
                                fontSize: '16px',
                                marginLeft: '10px',
                            }}>
                                Создать беседу
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{display:'flex', flexDirection:'column'}}> 
                        <Box sx={{
                                width: '933px', 
                                height: '500px',
                                position: 'relative',
                                boxShadow: 'none',
                                borderColor: 'rgba(0, 0, 0, 0)',
                                backgroundColor: '#F6EFFF', 
                                borderRadius: '23px',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    borderRadius: '23px',
                                    border: '2px solid transparent',
                                    background: 'linear-gradient(45deg, #8400FF, #FF00F6) border-box',
                                    WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                                    WebkitMaskComposite: 'destination-out',
                                    maskComposite: 'exclude'
                                }
                            }}>
                        </Box>
                        <Input 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder='Введите сообщение'
                            slotProps={{
                                input: {
                                    style: {
                                        textAlign: 'center',
                                        fontFamily: 'Montserrat'
                                    }
                                }
                            }}
                            sx={{
                                width: '277px', 
                                height: '63px',
                                marginTop: '20px',
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
                                    borderRadius: '23px',
                                    border: '2px solid transparent',
                                    background: 'linear-gradient(45deg, #8400FF, #FF00F6) border-box',
                                    WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                                    WebkitMaskComposite: 'destination-out',
                                    maskComposite: 'exclude'
                                }
                            }}
                        />
                    </Box>
                </Box>                
            </Box>
        </Box>
    );
}

export default ChatList;
