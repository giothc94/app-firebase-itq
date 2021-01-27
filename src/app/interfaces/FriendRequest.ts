import { User } from "./User";

export interface FriendRequest {
  timestamp: number;
  receiverEmail: string;
  sender: User;
  status: string;
}
