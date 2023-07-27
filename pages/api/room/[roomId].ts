// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import Room from '@/models/Room';
import dbConnect from '@/libs/dbConnect';

import { getErrorMessage } from '@/utils/getErrorMessage';

type ResponseError = {
  errorName: 'unknown' | 'no_method';
  message?: string;
};

type Room = {
  _id: string;
  status: 'waiting' | 'chatting';
};

type ResponseData = Room | ResponseError | string;

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  await dbConnect();

  const { method, query } = req;
  const roomId = query.roomId as string;

  if (method === 'PUT') {
    try {
      await Room.findByIdAndUpdate(roomId, {
        status: 'waiting',
      });

      return res.status(200).json('success');
    } catch (err) {
      const message = getErrorMessage(err);

      return res.status(400).json({ errorName: 'unknown', message });
    }
  }

  if (method === 'DELETE') {
    try {
      await Room.findByIdAndDelete(roomId);

      return res.status(200).json('success');
    } catch (err) {
      const message = getErrorMessage(err);

      return res.status(400).json({ errorName: 'unknown', message });
    }
  }

  return res.status(400).json({ errorName: 'no_method' });
}
