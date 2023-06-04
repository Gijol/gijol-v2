import { NextApiRequest, NextApiResponse } from 'next';
const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { title, description, email } = req.body;
    const databaseId = '9f8a6ec5addc4488ac03a82f06b6f95d';
    const response = await notion.pages.create({
      parent: {
        database_id: databaseId,
      },
      properties: {
        '기능 명': {
          type: 'title',
          title: [
            {
              type: 'text',
              text: {
                content: title,
              },
            },
          ],
        },
        '기능 설명': {
          type: 'rich_text',
          rich_text: [
            {
              type: 'text',
              text: {
                content: description,
              },
            },
          ],
        },
        '이메일 주소': {
          type: 'email',
          email: email,
        },
      },
    });
    if (!response) {
      await res.status(400).send('Error on getting response');
    }
    await res.status(200).send('OK');
  }
}
