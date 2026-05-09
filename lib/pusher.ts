import Pusher from "pusher";

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const pusherServer = new Pusher({
  appId: requireEnv("PUSHER_APP_ID"),
  key: requireEnv("PUSHER_KEY"),
  secret: requireEnv("PUSHER_SECRET"),
  cluster: requireEnv("PUSHER_CLUSTER"),
  useTLS: true
});
