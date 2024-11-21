import { Box, Typography, Input, Avatar, Button } from "@mui/joy";
import { motion } from "framer-motion";
import "@fontsource/jockey-one/400.css";
import "@fontsource/montserrat";
import icon from "../../../assets/icon.svg"
import Head from "../components/Head";
import { useState } from "react";


const TextColor = '#3C007D';

function Friendss() {
    const [searchEmail, setSearchEmail] = useState('');
    const [searchResult, setSearchResult] = useState<Array<{
        uid?: string;
        name: string;
        surname: string;
        photoURL?: string;
    }>>([]);
    const [userData, setUserData] = useState<{
        friends: string[];
    }>({ friends: [] });

    const sendFriendRequest = async (uid: string) => {
        // Здесь добавьте логику отправки запроса в друзья
        console.log('Отправка запроса в друзья:', uid);
    };

    return (
        <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} transition={{duration: 0.6}}>
            <Box>
            <Box sx={{display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '50px'}}>
                <Head />
            </Box>

                <Box sx={{
                    width: '170px', 
                    height: '557px', 
                    position: 'absolute', 
                    padding: '20px', 
                    borderRadius: '20px', 
                    border: '2px solid rgba(60, 0, 165, 0.05)',
                    backgroundColor: '#F4D9FF'}}>
                        <Box sx={{
                           display: 'flex',
                           flexDirection: 'column',
                           gap: '10px',
                        }}>
                            <Typography sx={{
                                fontFamily: 'Montserrat',
                                color: 'white',
                                background: 'linear-gradient(45deg, #8400FF, #F3B7FF)',
                                padding: '10px 20px',
                                borderRadius: '30px',
                                textAlign: 'center',
                                position: 'relative',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    borderRadius: '30px',
                                    boxShadow: 'inset 2px 5px 7.7px rgba(255, 255, 255, 0.56)',
                                    width: '100%',
                                    height: '100%',
                                    pointerEvents: 'none'
                                }
                            }}>
                                Курс
                            </Typography>
                            <Box sx={{
                           display: 'flex',
                           flexDirection: 'column',
                           gap: '10px'
                        }}>
                            <Typography sx={{
                                fontFamily: 'Montserrat',
                                color: 'white',
                                background: 'linear-gradient(45deg, #8400FF, #F3B7FF)',
                                padding: '10px 20px',
                                borderRadius: '30px',
                                textAlign: 'center',
                                position: 'relative',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    borderRadius: '30px',
                                    boxShadow: 'inset 2px 5px 7.7px rgba(255, 255, 255, 0.56)',
                                    width: '100%',
                                    height: '100%',
                                    pointerEvents: 'none'
                                }
                            }}>
                                Колледж
                            </Typography>
                            <Box sx={{
                           display: 'flex',
                           flexDirection: 'column',
                           gap: '10px'
                        }}>
                            <Typography sx={{
                                fontFamily: 'Montserrat',
                                color: 'white',
                                background: 'linear-gradient(45deg, #8400FF, #F3B7FF)',
                                padding: '10px 20px',
                                borderRadius: '30px',
                                textAlign: 'center',
                                position: 'relative',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    borderRadius: '30px',
                                    boxShadow: 'inset 2px 5px 7.7px rgba(255, 255, 255, 0.56)',
                                    width: '100%',
                                    height: '100%',
                                    pointerEvents: 'none'
                                }
                            }}>
                                Специальность
                            </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                <Box sx={{margin: '0 auto', maxWidth: '800px', left: '25%', position: 'absolute'}}>
                    <Input 
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                        placeholder="Поиск студентов"
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
                            height: '60px',
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
                                borderRadius: '20px', 
                                border: '2px solid rgba(60, 0, 165, 0.05)',
                                background: 'linear-gradient(45deg, #8400FF, #FF00F6) border-box',
                                WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                                WebkitMaskComposite: 'destination-out',
                                maskComposite: 'exclude'
                            }
                        }}
                    />
                    {searchResult.length > 0 && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: '30px' }}>
                            {searchResult.map((user) => (
                                <Box key={user.uid} sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    padding: '10px',
                                    borderRadius: '10px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                                }}>
                                    <Avatar src={user.photoURL} />
                                    <Typography>
                                        {`${user.name} ${user.surname}`}
                                    </Typography>
                                    {!userData?.friends.includes(user.uid!) && (
                                        <Button onClick={() => sendFriendRequest(user.uid!)}>
                                            Добавить в друзья
                                        </Button>
                                    )}
                                </Box>
                            ))}
                        </Box>
                    )}

                    {/* Карточка пользователя */}
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        padding: '20px',
                        backgroundColor: '#F4D9FF',
                        marginBottom: '20px',
                        borderRadius: '20px',
                        border: '2px solid rgba(60, 0, 165, 0.05)',
                    }}>
                        <Avatar sx={{width: 50, height: 50}} />
                        <Typography sx={{fontFamily: 'Montserrat', color: TextColor}}>
                            Дмитрий Ситников
                        </Typography>
                    </Box>

                    <Typography level="h3" sx={{fontFamily: 'Montserrat', color: TextColor, marginBottom: '20px'}}>
                        Все друзья
                    </Typography>

                    {/* Список друзей */}
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                        {['Дмитрий Ситников', 'Кофанов Андрей', 'Кантюков Камиль'].map((name) => (
                            <Box key={name} sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                padding: '15px',
                                borderRadius: '15px',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)'
                            }}>
                                <Avatar sx={{width: 40, height: 40}} />
                                <Typography sx={{fontFamily: 'Montserrat', color: TextColor}}>
                                    {name}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>
        </motion.div>
    );
}

export default Friendss;
