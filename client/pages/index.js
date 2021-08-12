const LandingPage = ({ currentUser }) => {
    return currentUser ? <h1>You are signed in</h1> : <h1> You are not signed in</h1>
};

// Use getServerSideProps for Server Side props (server-side rendering)
// Use getStaticProps when generating static props at build time (static-site generation)
LandingPage.getInitialProps = async (context, client, currentUser) => {
    return {};
};

export default LandingPage;
