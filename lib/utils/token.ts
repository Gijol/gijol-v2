import { useAuth } from '@clerk/nextjs';

export const getClerkTemplateToken = async () => {
  const { getToken } = useAuth();
  return await getToken({ template: 'gijol-token-test' });
};
