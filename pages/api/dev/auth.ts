import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { majorType, name, ...userStatus } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Simulate the behavior of the original signupAndGetResponse function
    // but return a mock successful response
    return res.status(201).json({
      message: 'User successfully signed up',
      data: {
        majorType,
        name,
        ...userStatus
      }
    });

  } catch (error) {
    console.error('Error in auth endpoint:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
