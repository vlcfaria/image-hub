import axios from 'axios';

const hubApiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default hubApiClient;