import { BASE_DEV_SERVER_URL } from '../const';
import { UserStatusType } from '../types';
import { getSession } from 'next-auth/react';
import { notifications } from '@mantine/notifications';
import { JWT } from 'next-auth/jwt';
import axios from 'axios';

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
    body: JSON.stringify({
      majorType: major_type,
      ...userStatus,
    }),
  });
  return { status: signupResponse.status, text: signupResponse.statusText };
};

export async function refreshAccessToken(token: JWT) {
  try {
    const url = 'https://oauth2.googleapis.com/token';
    const params = {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.GOOGLE_SECRET,
      grant_type: 'refresh_token',
      refresh_token: token.refreshToken,
    };

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    const res = await axios.post(url, null, {
      headers,
      params,
      auth: {
        username: process.env.CLIENT_ID as string,
        password: process.env.CLIENT_SECRET as string,
      },
    });

    const refreshedTokens = await res.data;

    if (res.status !== 200) {
      throw refreshedTokens;
    }

    return {
      ...token,
      access_token: refreshedTokens.access_token,
      expires_at: Math.round(Date.now() / 1000) + refreshedTokens.expires_in,
      refresh_token: refreshedTokens.refresh_token ?? token.refreshToken,
      id_token: refreshedTokens.id_token,
    };
  } catch (err) {
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}
