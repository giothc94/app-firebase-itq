export interface Conversation {
  uid: string;
  timestamp: number;
  text?: string;
  sender: string;
  receiver: string;
  type?: string;
  read?: boolean;
}
