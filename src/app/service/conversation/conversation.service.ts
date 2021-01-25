import { Injectable } from "@angular/core";
import firebase from "firebase";
import { Conversation } from "src/app/interfaces/Conversation";

@Injectable({
  providedIn: "root",
})
export class ConversationService {
  db: firebase.database.Database;

  constructor() {
    this.db = firebase.database();
  }

  createConversation(conversation: Conversation) {
    return this.db
      .ref(`conversation/${conversation.uid}/${conversation.timestamp}`)
      .set(conversation);
  }

  getConversation(uid) {
    return this.db.ref(`conversation/${uid}`)
  }
}
