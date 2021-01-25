import { Injectable } from "@angular/core";
import firebase from "firebase";
import { User } from "src/app/interfaces/User";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private db: firebase.database.Database;

  constructor() {
    this.db = firebase.database();
  }

  async checkin(user: User) {
    // registramos al usuario
    let credentials: firebase.auth.UserCredential = await firebase
      .auth()
      .createUserWithEmailAndPassword(user.email, user.password);
    // Obtenemos las credenciales - uid
    let uid = credentials.user.uid;
    // almacenamos los datos
    this.db.ref(`users/${uid}`).set({
      nickname: user.nickname,
      email: user.email,
      status: user.status,
    });
    // retornamos datos de usuario
    return {
      nickname: user.nickname,
      email: user.email,
      status: user.status,
    };
  }

  async login(email: string, password: string, status: string) {
    let credentials: firebase.auth.UserCredential = await firebase
      .auth()
      .signInWithEmailAndPassword(email, password);

    let user: firebase.User = credentials.user;

    this.db.ref(`users/${user.uid}`).update({
      status: status,
    });

    return user;
  }
}
