import { Box, Typography, Button, Input, Avatar } from "@mui/joy";
import Head from "../components/Head";
import { getAuth } from "firebase/auth";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, onSnapshot } from "firebase/firestore";
import { app } from "../firebase";
import { getDoc, doc, collection, getDocs, updateDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

const TextColor = '#3C007D';
interface UserData {
    uid?: string;
    name: string;
    surname: string;
    patronymic: string;
    photoURL?: string;
    friends: string[];
    friendRequests: string[];
    email: string;
    course?: string;
    college?: string;
    job?: string;
}

function Friends() {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [friends, setFriends] = useState<UserData[]>([]);
    const [friendRequests, setFriendRequests] = useState<UserData[]>([]);
    const [searchEmail, setSearchEmail] = useState('');
    const [searchResult, setSearchResult] = useState<UserData[]>([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const auth = getAuth(app);
    const db = getFirestore(app);

    const [courseFilter, setCourseFilter] = useState('');
    const [collegeFilter, setCollegeFilter] = useState('');
    const [jobFilter, setJobFilter] = useState('');

    const [availableCourses, setAvailableCourses] = useState<string[]>([]);
    const [availableColleges, setAvailableColleges] = useState<string[]>([]);
    const [availableJobs, setAvailableJobs] = useState<string[]>([]);

    const [showCourseDropdown, setShowCourseDropdown] = useState(false);
    const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
    const [showJobDropdown, setShowJobDropdown] = useState(false);

    const fetchFilterOptions = async () => {
        if (!auth.currentUser) return;

        try {
            const usersRef = collection(db, "users");
            const querySnapshot = await getDocs(usersRef);
            
            const courses = new Set<string>();
            const colleges = new Set<string>();
            const jobs = new Set<string>();

            querySnapshot.forEach((doc) => {
                const userData = doc.data() as UserData;
                if (userData.course && userData.course.trim()) courses.add(userData.course);
                if (userData.college && userData.college.trim()) colleges.add(userData.college);
                if (userData.job && userData.job.trim()) jobs.add(userData.job);
            });

            setAvailableCourses(Array.from(courses).sort());
            setAvailableColleges(Array.from(colleges).sort());
            setAvailableJobs(Array.from(jobs).sort());
        } catch (error) {
            console.error("Ошибка при загрузке опций фильтров:", error);
        }
    };

    useEffect(() => {
        fetchFilterOptions();
    }, [auth.currentUser]);

    useEffect(() => {
        if (!auth.currentUser) return;

        const userRef = doc(db, "users", auth.currentUser.uid);
        const unsubscribe = onSnapshot(userRef, async (docSnapshot) => {
            if (docSnapshot.exists()) {
                const currentUserData = docSnapshot.data() as UserData;
                setUserData(currentUserData);

                const friendsData = await Promise.all(
                    currentUserData.friends.map(async (friendId) => {
                        const friendDoc = await getDoc(doc(db, "users", friendId));
                        return { ...friendDoc.data(), uid: friendId } as UserData;
                    })
                );
                setFriends(friendsData);

                const requestsData = await Promise.all(
                    currentUserData.friendRequests.map(async (requestId) => {
                        const requestDoc = await getDoc(doc(db, "users", requestId));
                        return { ...requestDoc.data(), uid: requestId } as UserData;
                    })
                );
                setFriendRequests(requestsData);
            }
        });

        return () => unsubscribe();
    }, [auth.currentUser]);

    useEffect(() => {
        const searchUsers = async () => {
            if (!auth.currentUser) {
                setSearchResult([]);
                return;
            }

            try {
                const usersRef = collection(db, "users");
                const querySnapshot = await getDocs(usersRef);
                const searchTerms = searchEmail.toLowerCase().split(' ');
                
                let foundUsers: UserData[] = [];
                querySnapshot.forEach((doc) => {
                    const userData = doc.data() as UserData;
                    const fullName = `${userData.name} ${userData.surname}`.toLowerCase();
                    
                    if (doc.id === auth.currentUser!.uid) {
                        return;
                    }
                    
                    const matchesCourse = !courseFilter || userData.course === courseFilter;
                    const matchesCollege = !collegeFilter || userData.college?.toLowerCase().includes(collegeFilter.toLowerCase());
                    const matchesJob = !jobFilter || userData.job?.toLowerCase().includes(jobFilter.toLowerCase());
                    const matchesSearch = !searchEmail.trim() || searchTerms.every(term => fullName.includes(term));

                    if (matchesCourse && matchesCollege && matchesJob && matchesSearch) {
                        foundUsers.push({ ...userData, uid: doc.id });
                    }
                });

                setSearchResult(foundUsers);
            } catch (error) {
                console.error("Ошибка при поиске:", error);
            }
        };

        searchUsers();
    }, [searchEmail, courseFilter, collegeFilter, jobFilter, db, auth.currentUser]);

    const sendFriendRequest = async (targetUserId: string) => {
        if (!auth.currentUser) return;

        try {
            const targetUserRef = doc(db, "users", targetUserId);
            const targetUserDoc = await getDoc(targetUserRef);
            
            if (!targetUserDoc.exists()) {
                setError('Пользователь не найден');
                return;
            }
            
            const targetUserData = targetUserDoc.data() as UserData;
            
            if (!targetUserData.friendRequests) {
                targetUserData.friendRequests = [];
            }
            
            if (targetUserData.friendRequests.includes(auth.currentUser.uid)) {
                setError('Запрос уже отправлен');
                return;
            }

            if (targetUserData.friends && targetUserData.friends.includes(auth.currentUser.uid)) {
                setError('Этот пользователь уже в списке друзей');
                return;
            }

            await updateDoc(targetUserRef, {
                friendRequests: [...targetUserData.friendRequests, auth.currentUser.uid]
            });

            setSearchResult([]);
            setSearchEmail('');
            setError('Запрос отправлен');
        } catch (error) {
            console.error("Ошибка при отправке запроса:", error);
            setError('Ошибка при отправке запроса');
        }
    };

    const acceptFriendRequest = async (requesterId: string) => {
        if (!auth.currentUser || !userData) return;

        try {
            const currentUserRef = doc(db, "users", auth.currentUser.uid);
            await updateDoc(currentUserRef, {
                friends: [...userData.friends, requesterId],
                friendRequests: userData.friendRequests.filter(id => id !== requesterId)
            });

            const requesterRef = doc(db, "users", requesterId);
            const requesterDoc = await getDoc(requesterRef);
            const requesterData = requesterDoc.data() as UserData;
            await updateDoc(requesterRef, {
                friends: [...requesterData.friends, auth.currentUser.uid]
            });

            const updatedRequests = friendRequests.filter(request => request.uid !== requesterId);
            setFriendRequests(updatedRequests);
            const requesterWithId = { ...requesterData, uid: requesterId };
            setFriends([...friends, requesterWithId]);
        } catch (error) {
            console.error("Ошибка при принятии запроса:", error);
        }
    };

    const rejectFriendRequest = async (requesterId: string) => {
        if (!auth.currentUser || !userData) return;

        try {
            const currentUserRef = doc(db, "users", auth.currentUser.uid);
            await updateDoc(currentUserRef, {
                friendRequests: userData.friendRequests.filter(id => id !== requesterId)
            });

            const updatedRequests = friendRequests.filter(request => request.uid !== requesterId);
            setFriendRequests(updatedRequests);
        } catch (error) {
            console.error("Ошибка при отклонении запроса:", error);
            setError('Ошибка при отклонени запроса');
        }
    };

    const removeFriend = async (friendId: string) => {
        if (!auth.currentUser || !userData) return;

        try {
            const currentUserRef = doc(db, "users", auth.currentUser.uid);
            await updateDoc(currentUserRef, {
                friends: userData.friends.filter(id => id !== friendId)
            });

            const friendRef = doc(db, "users", friendId);
            const friendDoc = await getDoc(friendRef);
            const friendData = friendDoc.data() as UserData;
            await updateDoc(friendRef, {
                friends: friendData.friends.filter(id => id !== auth.currentUser!.uid)
            });

            const updatedFriends = friends.filter(friend => friend.uid !== friendId);
            setFriends(updatedFriends);
        } catch (error) {
            console.error("Ошибка при удалении друга:", error);
            setError('Ошибка при удалении друга');
        }
    };

    return (
        <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} transition={{duration: 0.6}}>
            <Box sx={{display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '50px'}}>
                <Head />
            </Box>
            <Box sx={{ display: 'flex', padding: '20px', gap: '30px' }}>
                <Box sx={{
                    width: '200px',
                    height: '577px',
                    padding: '20px',
                    borderRadius: '20px',
                    border: '2px solid rgba(60, 0, 165, 0.05)',
                    backgroundColor: '#F4D9FF'
                }}>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                    }}>
                        <Box sx={{ position: 'relative' }}>
                            <Typography 
                                onClick={() => setShowCourseDropdown(!showCourseDropdown)}
                                sx={{
                                    fontFamily: 'Montserrat',
                                    color: 'white',
                                    background: courseFilter ? 'linear-gradient(45deg, #FF00F6, #8400FF)' : 'linear-gradient(45deg, #8400FF, #F3B7FF)',
                                    padding: '10px 20px',
                                    borderRadius: '30px',
                                    textAlign: 'center',
                                    position: 'relative',
                                    cursor: 'pointer',
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
                                }}
                            >
                                {courseFilter || 'Курс'}
                            </Typography>
                            {showCourseDropdown && (
                                <Box sx={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    zIndex: 1000,
                                    backgroundColor: '#F4D9FF',
                                    borderRadius: '15px',
                                    marginTop: '5px',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                    border: '2px solid rgba(60, 0, 165, 0.05)',
                                }}>
                                    {availableCourses.map((course) => (
                                        <Typography
                                            key={course}
                                            onClick={() => {
                                                setCourseFilter(courseFilter === course ? '' : course);
                                                setShowCourseDropdown(false);
                                            }}
                                            sx={{
                                                padding: '8px 15px',
                                                cursor: 'pointer',
                                                fontFamily: 'Montserrat',
                                                color: courseFilter === course ? '#8400FF' : 'black',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(132, 0, 255, 0.1)',
                                                    borderRadius: '15px'
                                                }
                                            }}
                                        >
                                            {course} курс
                                        </Typography>
                                    ))}
                                </Box>
                            )}
                        </Box>

                        <Box sx={{ position: 'relative' }}>
                            <Typography 
                                onClick={() => setShowCollegeDropdown(!showCollegeDropdown)}
                                sx={{
                                    fontFamily: 'Montserrat',
                                    color: 'white',
                                    background: collegeFilter ? 'linear-gradient(45deg, #FF00F6, #8400FF)' : 'linear-gradient(45deg, #8400FF, #F3B7FF)',
                                    padding: '10px 20px',
                                    borderRadius: '30px',
                                    textAlign: 'center',
                                    position: 'relative',
                                    cursor: 'pointer',
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
                                }}
                            >
                                {collegeFilter || 'Колледж'}
                            </Typography>
                            {showCollegeDropdown && (
                                <Box sx={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    zIndex: 1000,
                                    backgroundColor: '#F4D9FF',
                                    borderRadius: '15px',
                                    marginTop: '5px',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                    border: '2px solid rgba(60, 0, 165, 0.05)',
                                }}>
                                    {availableColleges.map((college) => (
                                        <Typography
                                            key={college}
                                            onClick={() => {
                                                setCollegeFilter(collegeFilter === college ? '' : college);
                                                setShowCollegeDropdown(false);
                                            }}
                                            sx={{
                                                padding: '8px 15px',
                                                cursor: 'pointer',
                                                fontFamily: 'Montserrat',
                                                color: collegeFilter === college ? '#8400FF' : 'black',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(132, 0, 255, 0.1)',
                                                    borderRadius: '15px'
                                                }
                                            }}
                                        >
                                            {college}
                                        </Typography>
                                    ))}
                                </Box>
                            )}
                        </Box>

                        <Box sx={{ position: 'relative' }}>
                            <Typography 
                                onClick={() => setShowJobDropdown(!showJobDropdown)}
                                sx={{
                                    fontFamily: 'Montserrat',
                                    color: 'white',
                                    background: jobFilter ? 'linear-gradient(45deg, #FF00F6, #8400FF)' : 'linear-gradient(45deg, #8400FF, #F3B7FF)',
                                    padding: '10px 20px',
                                    borderRadius: '30px',
                                    textAlign: 'center',
                                    position: 'relative',
                                    cursor: 'pointer',
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
                                }}
                            >
                                {jobFilter || 'Специальность'}
                            </Typography>
                            {showJobDropdown && (
                                <Box sx={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    zIndex: 1000,
                                    backgroundColor: '#F4D9FF',
                                    borderRadius: '15px',
                                    marginTop: '5px',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                    border: '2px solid rgba(60, 0, 165, 0.05)',
                                }}>
                                    {availableJobs.map((job) => (
                                        <Typography
                                            key={job}
                                            onClick={() => {
                                                setJobFilter(jobFilter === job ? '' : job);
                                                setShowJobDropdown(false);
                                            }}
                                            sx={{
                                                padding: '8px 15px',
                                                cursor: 'pointer',
                                                fontFamily: 'Montserrat',
                                                color: jobFilter === job ? '#8400FF' : 'black',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(132, 0, 255, 0.1)',
                                                    borderRadius: '15px'
                                                }
                                            }}
                                        >
                                            {job}
                                        </Typography>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Box>

                <Box sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px'
                }}>
                    <Box sx={{
                        width: '100%',
                        maxWidth: '400px',
                        position: 'relative'
                    }}>
                        <Input 
                            value={searchEmail}
                            onChange={(e) => setSearchEmail(e.target.value)}
                            placeholder="Поиск студентов"
                            startDecorator={<SearchRoundedIcon sx={{color: 'black'}} />}
                            slotProps={{
                                input: {
                                    style: {
                                        textAlign: 'left',
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
                        >
                        </Input>
                        
                        {searchEmail.trim() !== '' && searchResult.length > 0 && (
                            <Box sx={{ 
                                position: 'absolute',
                                top: '80%',
                                left: 0,
                                right: 0,
                                zIndex: 1,
                                width: '278px',
                                backgroundColor: 'rgba(140, 70, 200, 1)',
                                borderRadius: '20px',
                                padding: '10px',
                                marginTop: '5px',
                                border: '2px solid rgba(60, 0, 165, 0.05)',
                                maxHeight: '566px',
                            }}>
                                {searchResult.map((user) => (
                                    <Box key={user.uid} sx={{
                                        display: 'flex',
                                        gap: 2,
                                        padding: '10px',
                                        borderRadius: '20px',   
                                        border: '2px solid rgba(60, 0, 165, 0.05)',
                                        backgroundColor: 'rgba(244, 217, 255, 1)',
                                        width: '253px',
                                        height: '80px',
                                        marginTop: '10px',
                                    }}>
                                        <Avatar src={user.photoURL} sx={{height: '80px', width: '80px', marginLeft: '10px'}}/>
                                        <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'start'}}>
                                            <Typography level="h4" sx={{fontFamily: 'Montserrat', color: 'black', fontSize: '15px', marginLeft: '-3px'}}>
                                                {`${user.name} ${user.surname}`}
                                            </Typography>
                                            {!userData?.friends.includes(user.uid!) && (
                                                <Button onClick={() => sendFriendRequest(user.uid!)} sx={{
                                                    height: '30px',
                                                    width: '140px',
                                                    marginTop: '5px',
                                                    fontFamily: 'Montserrat',
                                                    fontSize: '10px',
                                                    backgroundColor: 'transparent',
                                                    color: '#8400FF',
                                                    border: '2px solid rgba(60, 0, 165, 0.05)',
                                                    borderRadius: '15px',
                                                    position: 'relative',
                                                    marginLeft: '-8px',  
                                                    '&::before': {
                                                        content: '""',
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        right: 0,
                                                        bottom: 0,
                                                        borderRadius: '15px',
                                                        border: '2px solid transparent',
                                                        background: 'linear-gradient(45deg, #8400FF, #FF00F6) border-box',
                                                        WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                                                        WebkitMaskComposite: 'destination-out',
                                                        maskComposite: 'exclude'
                                                    },
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(132, 0, 255, 0.1)',
                                                        borderRadius: '15px'
                                                    }
                                                }}>
                                                    Добавить в друзья
                                                </Button>
                                            )}
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Box>

                    <Box sx={{
                        display: 'flex',
                        gap: '20px',
                        flexWrap: 'wrap'
                    }}>
                        <Box sx={{
                            flex: '1 1 0px',
                            minWidth: '0px',
                            minHeight: '477px',
                            maxHeight: '477px',
                            backgroundColor: '#F4D9FF',
                            padding: '20px',
                            borderRadius: '20px',
                            border: '2px solid rgba(60, 0, 165, 0.05)'
                        }}>
                            <Typography level="h3" sx={{
                                fontFamily: 'Montserrat', 
                                color: TextColor,
                                fontSize: '16px'
                            }}>
                                Мои друзья ({friends.length})
                            </Typography>
                            
                            {friends.map((friend) => (
                                <Box key={friend.email} sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    marginTop: '15px',
                                    padding: '10px',
                                    borderRadius: '15px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                    transition: 'background-color 0.2s',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.5)',
                                        borderRadius: '15px'
                                    }
                                }}>
                                    <Avatar 
                                        sx={{
                                            cursor: 'pointer',
                                            width: '40px',
                                            height: '40px'
                                        }} 
                                        src={friend.photoURL} 
                                        onClick={() => navigate(`/friend/${friend.uid}`)}
                                    />
                                    <Typography 
                                        sx={{
                                            cursor: 'pointer',
                                            fontFamily: 'Montserrat',
                                            color: TextColor,
                                            fontSize: '14px'
                                        }} 
                                        onClick={() => navigate(`/friend/${friend.uid}`)}
                                    >
                                        {`${friend.name} ${friend.surname}`}
                                    </Typography>
                                    <Button 
                                        onClick={() => removeFriend(friend.uid!)}
                                        sx={{
                                            fontFamily: 'Montserrat',
                                            fontSize: '10px',
                                            color: '#FF0000',
                                            backgroundColor: 'transparent',
                                            marginLeft: 'auto',
                                            padding: '5px 10px',
                                            '&:hover': {
                                                backgroundColor: 'rgba(255, 0, 0, 0.1)',
                                                borderRadius: '15px'
                                            }
                                        }}
                                    >
                                        Удалить
                                    </Button>
                                </Box>
                            ))}
                        </Box>

                        <Box sx={{
                            flex: '1 1 300px',
                            minWidth: '300px',
                            backgroundColor: '#F4D9FF',
                            padding: '20px',
                            borderRadius: '20px',
                            border: '2px solid rgba(60, 0, 165, 0.05)',
                            marginTop: '-102px'
                        }}>
                            <Typography level="title-md" sx={{
                                fontFamily: 'Montserrat',
                                color: TextColor,
                                marginBottom: '10px'
                            }}>
                                Входящие заявки ({friendRequests.length})
                            </Typography>
                            
                            {friendRequests.map((request) => (
                                <Box key={request.uid} sx={{
                                    display: 'flex',
                                    gap: 2,
                                    padding: '10px',
                                    borderRadius: '20px',
                                    border: '2px solid rgba(60, 0, 165, 0.05)',
                                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                    width: '100%',
                                    height: '80px'
                                }}>
                                    <Avatar src={request.photoURL} sx={{height: '80px', width: '80px', marginLeft: '10px'}}/>
                                    <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'start'}}>
                                        <Typography level="h4" sx={{
                                            fontFamily: 'Montserrat',
                                            color: 'black',
                                            fontSize: '15px',
                                            marginLeft: '-3px'
                                        }}>
                                            {`${request.name} ${request.surname}`}
                                        </Typography>
                                        <Box sx={{display: 'flex', gap: 1, marginTop: '5px'}}>
                                            <Button onClick={() => acceptFriendRequest(request.uid!)} sx={{
                                                height: '30px',
                                                width: '80px',
                                                fontFamily: 'Montserrat',
                                                fontSize: '10px',
                                                backgroundColor: 'transparent',
                                                color: '#8400FF',
                                                border: '2px solid rgba(60, 0, 165, 0.05)',
                                                borderRadius: '15px',
                                                position: 'relative',
                                                marginLeft: '-8px',
                                                '&::before': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    borderRadius: '15px',
                                                    border: '2px solid transparent',
                                                    background: 'linear-gradient(45deg, #8400FF, #FF00F6) border-box',
                                                    WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                                                    WebkitMaskComposite: 'destination-out',
                                                    maskComposite: 'exclude'
                                                },
                                                '&:hover': {
                                                    backgroundColor: 'rgba(132, 0, 255, 0.1)',
                                                    borderRadius: '15px'
                                                }
                                            }}>
                                                Принять
                                            </Button>
                                            <Button onClick={() => rejectFriendRequest(request.uid!)} sx={{
                                                height: '30px',
                                                width: '80px',
                                                fontFamily: 'Montserrat',
                                                fontSize: '10px',
                                                backgroundColor: 'transparent',
                                                color: '#FF0000',
                                                border: '2px solid rgba(255, 0, 0, 0.05)',
                                                borderRadius: '15px',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(255, 0, 0, 0.1)',
                                                    borderRadius: '15px'
                                                }
                                            }}>
                                                Отклонить
                                            </Button>
                                        </Box>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Box>
            </Box>
        </motion.div>
    );
}

export default Friends;
