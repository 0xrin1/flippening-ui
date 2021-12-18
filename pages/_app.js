import App from 'next/app';
import '../styles/global.scss';

function MyApp({ Component, pageProps }) {
    return <Component {...pageProps} />
}


MyApp.getInitialProps = async (ctx) => {
    const initialProps = await App.getInitialProps(ctx);
    const userAgent = typeof window === 'undefined' ? ctx?.req?.headers['user-agent'] : window.navigator.userAgent;

    return { userAgent, ...initialProps };
};

export default MyApp;
