import Pusher from "pusher";
const _pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true
});

export const trigger = (gid, sender, action, data) => {
  _pusher.trigger(process.env.PUSHER_CHANNEL_HEAD + gid, action, {
    sender,
    ...data
  });
};
