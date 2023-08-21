import axios from 'axios';
import { notifications } from '@mantine/notifications';
import { instance } from './instance';

export const sendFeedbackToNotion = async (title: string, description: string, email: string) => {
  await axios.post(`/api/notion`, {
    title,
    description,
    email,
  });
};
