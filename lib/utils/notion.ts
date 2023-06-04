import axios from 'axios';
import { notifications } from '@mantine/notifications';

export const sendFeedbackToNotion = async (title: string, description: string, email: string) => {
  const res = await axios.post(`${location.origin}/api/notion`, {
    title,
    description,
    email,
  });
  if (res.status === 200) {
    await notifications.show({
      color: 'teal',
      title: '의견을 남겨주셔서 감사합니다!',
      message: '소중한 의견을 남겨주셔서 감사드립니다! 남겨주신 의견을 최대한 반영해보겠습니다! 🤗',
      autoClose: 3000,
    });
  } else {
    await notifications.show({
      color: 'orange',
      title: '전송오류',
      message: '의견이 제대로 전송되지 않았습니다... 다시 한번 시도 부탁드립니다! 🙇‍♂️',
      autoClose: 3000,
    });
  }
};
