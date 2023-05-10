import { BASE_DEV_SERVER_URL } from '../const';
import { AuthTypeCheckResponseType, InternalTokenType } from '../types/auth';
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

export const getInternalToken = async (session: Session): Promise<InternalTokenType> => {
  const { name, email, id_token } = await session.user;
  const loginResponse = await fetch(`${BASE_DEV_SERVER_URL}/api/v1/auth/google/sign-in`, {
    method: 'POST',
    body: JSON.stringify({ name, email, id_token: idToken }),
  });
  if (!loginResponse.ok) {
    throw new Error('Failed to fetch internal token from gijol server');
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
