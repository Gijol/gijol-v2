import { BASE_DEV_SERVER_URL } from '../const';
import { MembershipStatusResponseType, InternalTokenType } from '../types/auth';
import { UserStatusType, UserTakenCourse, UserType } from '../types';
import { Session } from 'next-auth';
import { getSession } from 'next-auth/react';
import { notifications } from '@mantine/notifications';

export const getAuthTypeResponse = async (): Promise<'SIGN_UP' | 'SIGN_IN'> => {
  const session = await getSession();
  const authTypeResponse = await fetch(`${BASE_DEV_SERVER_URL}/api/v1/auth/google`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session?.user.id_token}`,
      'Content-Type': 'application/json',
    },
  });
  return authTypeResponse.json();
};

export const getMembershipStatus = async (
  id_token: string | undefined
): Promise<'SIGN_IN' | 'SIGN_UP'> => {
  if (!id_token) {
    throw new Error('No Id token');
  }
  const loginResponse = await fetch(`${BASE_DEV_SERVER_URL}/api/v1/auth/google`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${id_token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!loginResponse.ok) {
    notifications.show({
      title: 'Gijol 서버 통신 오류',
      message: '로그인에 실패했습니다. 현재 탭을 끄고 다시 로그인을 진행해주시길 바랍니다.',
    });
  }
  return loginResponse.json();
};

export const signupAndGetResponse = async (
  userStatus: UserStatusType,
  id_token: string | null | undefined,
  major_type: string
) => {
  const signupResponse = await fetch(`${BASE_DEV_SERVER_URL}/api/v1/auth/google/sign-up`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${id_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userStatus),
  });
  return { status: signupResponse.status, text: signupResponse.statusText };
};
