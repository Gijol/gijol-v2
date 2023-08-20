import { FileWithPath } from '@mantine/dropzone';
import { readFileAndParse } from './graduation/grad-formatter';
import { notifications } from '@mantine/notifications';
import { instance } from './instance';
import router from 'next/router';
import { SignOut } from '@clerk/types';
import { clerkClient } from '@clerk/clerk-sdk-node';
import axios from 'axios';

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

export const deleteUserInfo = async (
  token: string | null,
  user_id: string | undefined,
  signOut: SignOut
) => {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
  try {
    if (user_id === undefined) {
      throw new Error('no user_id');
    }
    await instance.delete('/api/v1/users/me', { headers });
    await axios.post('/api/user/delete', { userId: user_id });
    await signOut();
    await notifications.show({
      title: '회원 탈퇴 완료',
      message: '데이터가 정상적으로 삭제되었습니다',
    });
    await router.push('/dashboard');
  } catch (err) {
    await notifications.show({
      title: '회원 탈퇴 오류',
      message: '정상적으로 회원 탈퇴가 이루어지지 않았습니다',
      color: 'red',
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
