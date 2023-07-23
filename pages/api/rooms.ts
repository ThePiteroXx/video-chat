// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import Room from '@/models/Room';
import dbConnect from '@/libs/dbConnect';

type Data = {
  status: 'waiting' | 'chatting';
};

type ResponseData = Data[] | string;

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  await dbConnect();

  if (req.method === 'GET') {
    const rooms = await Room.find({});
    console.log(rooms);
    return res.status(200).json([{ status: 'waiting' }]);
  }

  return res.status(400).json('No method for this endpoint');
}
