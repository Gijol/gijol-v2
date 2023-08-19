import { FileWithPath } from '@mantine/dropzone';
import { getSession } from 'next-auth/react';
import axios from 'axios';
import { BASE_DEV_SERVER_URL } from '../const';
import { readFileAndParse } from './graduation/grad-formatter';
import { notifications } from '@mantine/notifications';
import { useAuth } from '@clerk/nextjs';
import { getClerkTemplateToken } from './token';
import { instance } from './instance';

const putUserMajorInfo = async (major: string, token: string) => {
  const data = {
    majorType: major,
  };
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
  await instance.put(`/api/v1/users/me/major`, data, { headers });
};

const putUserFileInfo = async (fileInfo: FileWithPath, token: string) => {
  const parsedUserStatus = await readFileAndParse(fileInfo);
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
  await instance.put(`/api/v1/users/me/taken-courses`, parsedUserStatus, {
    headers,
  });
};

export const updateUserInfo = async (
  major: string | null,
  fileInfo: FileWithPath | undefined,
  token: string | null
) => {
  try {
    if (token) {
      if (major) {
        await putUserMajorInfo(major, token);
      }
      if (fileInfo) {
        await putUserFileInfo(fileInfo, token);
      }
    }
    await notifications.show({
      color: 'teal',
      title: '변경사항 적용 완료',
      message: '변경하신 부분들이 적용 완료되었습니다!',
    });
    await location.reload();
  } catch (e) {
    console.log(e);
    await notifications.show({
      color: 'red',
      title: '변경사항 적용 안됨',
      message: '변경하신 부분들이 적용되지 않았습니다... 다시 한번 시도해주세요!',
    });
  }
};

export const convertMajorTypeToText = (type: string) => {
  switch (type) {
    case 'EC':
      return '전기전자컴퓨터공학전공';
    case 'MA':
      return '신소재공학전공';
    case 'EV':
      return '지구환경공학전공';
    case 'BS':
      return '생명과학전공';
    case 'CH':
      return '화학전공';
    case 'MC':
      return '기계공학전공';
    case 'PS':
      return '물리광과학전공';
    default:
      return '';
  }
};
