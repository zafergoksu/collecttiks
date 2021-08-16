import axios from 'axios';

const buildClient = ({ req }) => {
    if (typeof window === 'undefined') {
        // On the server
        return axios.create({
            baseURL: 'http://www.collecttiks.xyz',
            headers: req.headers,
        });
    } else {
        // On the client
        return axios.create({
            baseURL: '/',
        });
    }
};

export default buildClient;
