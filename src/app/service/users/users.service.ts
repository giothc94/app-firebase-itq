import { Injectable } from '@angular/core';
import firebase from "firebase";

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  db: firebase.database.Database;

  constructor() {
    this.db = firebase.database()
  }

  getUser(uid) {
    return this.db.ref(`users/${uid}`)
  }

  getUsers() {
    return this.db.ref('users')
  }

  updateUser(uid, data) {
    this.db.ref(`users/${uid}`).update(data);
  }
}
