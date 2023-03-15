import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  return res.send({ loginInfo: 'loginInfo not came here' });
}
