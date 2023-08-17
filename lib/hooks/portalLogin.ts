import { portalLogin } from '../utils/portal-login';
import { LoginProps } from '../types';
import { useQuery } from 'react-query';

export const usePortalLogin = (loginInfo: LoginProps) => {
  const queryFn = () => portalLogin(loginInfo);
  const { data, isLoading } = useQuery(['portalLoginCookie', loginInfo.id], queryFn);
  return { data, isLoading };
};
