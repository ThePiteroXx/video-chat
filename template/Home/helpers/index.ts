import { Room } from '@/types/roomApi';

const leaveRoom = async (room: Room) => {
  if (room.status === 'chatting') {
    await fetch(`/api/room/${room._id}`, {
      method: 'PUT',
    });
    return;
  }

  await fetch(`/api/room/${room._id}`, {
    method: 'DELETE',
  });
};

export { leaveRoom };
