import { Injectable } from "@angular/core";
import firebase from "firebase";
import { User } from "src/app/interfaces/User";
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
  getRequestByEmail(email: string) {
    let cleanEmail = email.replace(".", "|");
    return this.db.ref(`friend_requests/${cleanEmail}`);
  }
  addFriend(friendRequest:FriendRequest, currentUser: User) {
    // Eliminar solicitud
    let cleanEmailSender = friendRequest.sender.email.replace(".", "|");
    let cleanEmailReceiver = friendRequest.receiverEmail.replace(".", "|");

    this.db.ref(`friend_requests/${cleanEmailSender}/${currentUser.uid}`).remove();
    this.db.ref(`friend_requests/${cleanEmailReceiver}/${friendRequest.sender.uid}`).remove();
    // Agregar amigos
    this.db.ref(`users/${currentUser.uid}/friends/${friendRequest.sender.uid}`).set(friendRequest.sender.uid);
    return this.db.ref(`users/${friendRequest.sender.uid}/friends/${currentUser.uid}`).set(currentUser.uid);
  }
}
