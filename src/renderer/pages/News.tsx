import { Box, Typography } from '@mui/joy';
import { motion } from 'framer-motion';
import "@fontsource/montserrat";
import { useNavigate } from 'react-router-dom';
import Head from '../components/Head';

const TextColor = '#3C007D';

function News() {
    const navigate = useNavigate();

    return (
        <motion.div>
            <Box sx={{display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '50px'}}>
                <Head />
            </Box>
            <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', border: '1px solid #E100FF', padding: '20px', borderRadius: '60px'}}>
                <Typography level="h2" sx={{fontFamily: 'Montserrat', fontSize: '32px', color: TextColor}}>Имя Имя</Typography>
                <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', borderColor: 'red'}}>
                    <img src={""} alt="Новость" style={{height: '200px'}} />
                    <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', width: '100%', borderColor: 'red'}}>
                        <Typography level="h4" sx={{fontFamily: 'Montserrat', fontSize: '18px', color: TextColor}}>Описание</Typography>
                        <Typography level="h4" sx={{fontFamily: 'Montserrat', fontSize: '18px', color: TextColor}}>Прочитать полностью</Typography>
                    </Box>
                </Box>
            </Box>
        </motion.div>
    );
}

export default News;