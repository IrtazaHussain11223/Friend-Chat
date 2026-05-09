export interface Message {
  id: string;
  username: string;
  text: string;
  timestamp: string;
}

export interface SendMessagePayload {
  username: string;
  text: string;
}
