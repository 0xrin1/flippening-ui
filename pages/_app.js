// import App from 'next/app';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import '../styles/global.scss';

const theme = createTheme({
    palette: {
        mode: 'dark',
    },
});

function MyApp({ Component, pageProps }) {
    return <ThemeProvider theme={ theme }>
        <Component {...pageProps} />
    </ThemeProvider>;
};

export default MyApp;
