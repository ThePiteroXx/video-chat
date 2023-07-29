// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import Room from '@/models/Room';
import dbConnect from '@/libs/dbConnect';

import { getErrorMessage } from '@/utils/getErrorMessage';
import { getRtmToken } from '@/utils/agora';
import type { ResponseData, Room as RoomType } from '@/types/roomApi';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  await dbConnect();

  const userId = req.query.userId;

  if (!userId || Array.isArray(userId)) {
    return res.status(400).json('Lack of query param');
  }

  if (req.method === 'GET') {
    try {
      // search randomly room with waiting status
      let [room] = await Room.aggregate<RoomType | null>([
        { $match: { status: 'waiting' } },
        { $sample: { size: 1 } },
      ]);

      // create room if not exists
      if (!room) {
        const newRoom = (await Room.create<RoomType>({ status: 'waiting' })) as RoomType;
        return res
          .status(200)
          .json({ _id: newRoom._id, status: newRoom.status, rtmToken: getRtmToken(userId) });
      }

      // update status if room exists
      room = (await Room.findByIdAndUpdate(
        room._id,
        {
          status: 'chatting',
        },
        { returnOriginal: false }
      )) as RoomType;

      return res
        .status(200)
        .json({ _id: room._id, status: room.status, rtmToken: getRtmToken(userId) });
    } catch (err) {
      const message = getErrorMessage(err);
      return res.status(400).json({ errorName: 'unknown', message });
    }
  }

  return res.status(400).json({ errorName: 'no_method' });
}
