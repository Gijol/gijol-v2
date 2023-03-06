import { NextApiRequest, NextApiResponse } from 'next';
import { LoginProps } from '../../lib/types';
import { portalLogin } from '../../lib/utils/portalLogin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const loginInfoString: string = await req.body;
  // const loginInfo = JSON.parse(loginInfoString);
  // const cookies = await portalLogin(loginInfo);
  res.status(200).send({ loginInfoString });
}
