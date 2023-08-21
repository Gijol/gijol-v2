import axios from 'axios';
import { BASE_SERVER_URL } from '../const';

export const instance = axios.create({
  baseURL: BASE_SERVER_URL,
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401) {
      // router.push(`/dashboard/error`);
      console.log(error);
    }
    console.log(error);
  }
);
