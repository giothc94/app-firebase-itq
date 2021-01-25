import { Component } from "@angular/core";
import { User } from "../interfaces/User";
import { UsersService } from "../service/users/users.service";
import firebase from "firebase";
import { MenuController, NavController } from "@ionic/angular";
@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"],
})
export class HomePage {
  user = {} as User;
  friends = [];

  constructor(
    private menu: MenuController,
    private userService: UsersService,
    private router: NavController
  ) {
    this.menu.enable(true);
    firebase.auth().onAuthStateChanged((currentUser) => {
      if (currentUser) {
        this.userService.getUser(currentUser.uid).on("value", (snapshot) => {
          const data = snapshot.val();
          this.user.email = data.email;
          this.user.nickname = data.nickname;
          this.user.status = data.status;
        });
        this.userService.getUsers().on("value", (snapshot) => {
          this.friends = [];
          snapshot.forEach((user) => {
            this.friends.push({uid: user.key, profile: user.val()})
          })
        })
      } else this.router.navigateRoot(["login"]);
    });
  }
}
