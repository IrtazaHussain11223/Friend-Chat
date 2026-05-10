export const CHAT_CHANNEL_PREFIX = "chat-room";
export const NEW_MESSAGE_EVENT = "new-message";
export const ACCESS_COOKIE = "friend_chat_session";
export const MAX_MESSAGE_LENGTH = 1000;
export const MAX_USERNAME_LENGTH = 32;
export const MAX_ROOM_ID_LENGTH = 40;
export const MESSAGE_HISTORY_LIMIT = 100;

export function normalizeRoomId(roomId: string) {
  return roomId
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, MAX_ROOM_ID_LENGTH);
}

export function getChatChannel(roomId: string) {
  return `${CHAT_CHANNEL_PREFIX}-${normalizeRoomId(roomId) || "general"}`;
}
