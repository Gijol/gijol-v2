import { BASE_DEV_SERVER_URL } from '../const';
import { MembershipStatusResponseType, InternalTokenType } from '../types/auth';
import { UserTakenCourse, UserType } from '../types';
import { Session } from 'next-auth';

export const getAuthTypeResponse = async (session: Session | any): Promise<string> => {
  const { name, email, idToken } = await session.user;
  const authTypeResponse = await fetch(`${BASE_DEV_SERVER_URL}/api/v1/auth/google`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, idToken }),
  });
  if (!authTypeResponse.ok) {
    throw new Error('Failed to exchange Google token for internal token');
  }
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
      ContentType: 'application/json',
    },
  });
  if (!loginResponse.ok) {
    throw new Error('Failed to fetch 회원여부 from gijol server');
  }
  return loginResponse.json();
};

export const signupAndGetResponse = async (userStatus: UserType) => {
  const signupResponse = await fetch(`${BASE_DEV_SERVER_URL}/api/v1/auth/google/sign-up`, {
    method: 'POST',
    body: JSON.stringify(userStatus),
  });
  return { status: signupResponse.status, text: signupResponse.statusText };
};
