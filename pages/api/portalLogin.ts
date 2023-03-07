import { NextApiRequest, NextApiResponse } from 'next';
import { LoginProps } from '../../lib/types';
import { portalLogin } from '../../lib/utils/portalLogin';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  if (req.method === 'POST') {
    const loginInfoString: string = await req.body;
    const loginInfo = await JSON.parse(loginInfoString);
    const cookies = await portalLogin(loginInfo);
    return res.send({ cookies });
  }
  return res.send({ loginInfo: 'loginInfo not came here' });
}
