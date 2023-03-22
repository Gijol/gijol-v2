import { NextApiRequest, NextApiResponse } from 'next';
import { initialValue } from '../../lib/const/grad';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const sessionStorage = typeof window !== 'undefined' ? window.sessionStorage : null;
  const gradStatus = await sessionStorage?.getItem('gradStatus');
  const sessionGradStatusValue = gradStatus ? JSON.parse(gradStatus).gradStatus : initialValue;
  return res.send({ status: sessionGradStatusValue });
}
