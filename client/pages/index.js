import buildClient from '../api/build-client';

const LandingPage = ({ currentUser }) => {
    return currentUser ? <h1>You are signed in</h1> : <h1> You are not signed in</h1>
};

// Use getServerSideProps for Server Side props (server-side rendering)
// Use getStaticProps when generating static props at build time (static-site generation)
LandingPage.getInitialProps = async (context) => {
    const { data } = await buildClient(context).get('/api/users/currentuser');
    return data;
};

export default LandingPage;
