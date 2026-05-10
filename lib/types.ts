export interface Message {
  id: string;
  roomId: string;
  username: string;
  text: string;
  timestamp: string;
}

export interface SendMessagePayload {
  roomId: string;
  username: string;
  text: string;
}
