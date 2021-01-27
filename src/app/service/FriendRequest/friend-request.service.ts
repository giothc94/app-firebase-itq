import { Injectable } from "@angular/core";
import firebase from "firebase";
import { FriendRequest } from "../../interfaces/FriendRequest";

@Injectable({
  providedIn: "root",
})
export class FriendRequestService {
  db: firebase.database.Database;

  constructor() {
    this.db = firebase.database();
  }

  createRequest(friendRequest: FriendRequest) {
    let cleanEmail = friendRequest.receiverEmail.replace(".", "|");
    return this.db
      .ref(`friend_requests/${cleanEmail}/${friendRequest.sender.uid}`)
      .set(friendRequest);
  }
}
