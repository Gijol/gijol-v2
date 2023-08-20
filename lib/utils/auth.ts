import { BASE_DEV_SERVER_URL } from '../const';
import { UserStatusType } from '../types';
import { JWT } from 'next-auth/jwt';
import { TokenSet } from 'next-auth';
import { instance } from './instance';

export const getAuthTypeResponse = async (
  token: string | null
): Promise<{ isNewUser: boolean }> => {
  const res = await instance.post('/api/v1/auth', null, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return res.data;
};

export const signupAndGetResponse = async (
  user_status: UserStatusType,
  token: string | null,
  major_type: string,
  user_name: string
) => {
  try {
    const sign_up_response = await fetch(`${BASE_DEV_SERVER_URL}/api/v1/auth/google/sign-up`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        majorType: major_type,
        name: user_name,
        ...user_status,
      }),
    });
    return { status: sign_up_response.status, text: sign_up_response.statusText };
  } catch (e) {
    console.log('Upload Error', e);
    throw e;
  }
};

export async function refreshAccessToken(token: JWT) {
  try {
    const url = 'https://oauth2.googleapis.com/token';
    const params = {
      client_id: process.env.GOOGLE_ID,
      client_secret: process.env.GOOGLE_SECRET,
      grant_type: 'refresh_token',
      refresh_token: token.refresh_token,
    };

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    const res = await instance.post(url, null, {
      headers,
      params,
    });

    const refreshed_tokens: TokenSet = await res.data;

    if (res.status !== 200) {
      throw refreshed_tokens;
    }

    return {
      ...token,
      access_token: refreshed_tokens.access_token,
      expires_at: Math.floor(Date.now() / 1000 + Number(refreshed_tokens.expires_at)),
      refresh_token: refreshed_tokens.refresh_token ?? token.refresh_token,
      id_token: refreshed_tokens.id_token,
    };
  } catch (err) {
    console.log('Error refreshing access token', err);
    return {
      ...token,
      error: 'RefreshAccessTokenError' as const,
    };
  }
}

type UserExists = {
  new_user: boolean;
  existing_user: boolean;
  not_user: boolean;
};
export const getUserAuthType = (isAuth: boolean, isMember: boolean): keyof UserExists => {
  if (isAuth) {
    if (!isMember) {
      return 'new_user';
    }
    return 'existing_user';
  } else {
    return 'not_user';
  }
};
