import type { NextApiRequest, NextApiResponse } from 'next';
import Room from '@/models/Room';
import dbConnect from '@/libs/dbConnect';

import { getErrorMessage } from '@/utils/getErrorMessage';

import type { ResponseData, Room as RoomType } from '@/types/roomApi';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const { roomId } = req.query;
      if (!roomId || Array.isArray(roomId))
        return res
          .status(400)
          .json({ errorName: 'unknown', message: 'Lack of roomId in query params' });

      const room = await Room.findById<RoomType>(roomId);

      if (!room) return res.status(404).json({ errorName: 'no_found' });

      return res.status(200).json(room);
    } catch (err) {
      const message = getErrorMessage(err);
      return res.status(400).json({ errorName: 'unknown', message });
    }
  }

  return res.status(400).json({ errorName: 'no_method' });
}
