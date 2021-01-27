import { Component } from "@angular/core";
import { User } from "../interfaces/User";
import { UsersService } from "../service/users/users.service";
import firebase from "firebase";
import {
  MenuController,
  NavController,
  AlertController,
  ToastController,
} from "@ionic/angular";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"],
})
export class HomePage {
  user = {} as User;
  friends = [];
  formAddFriend: FormGroup;

  constructor(
    private menu: MenuController,
    private userService: UsersService,
    private router: NavController,
    public alertController: AlertController,
    private formBuilder: FormBuilder,
    public toast: ToastController
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
            this.friends.push({ uid: user.key, profile: user.val() });
          });
        });
      } else this.router.navigateRoot(["login"]);
    });
    this.formAddFriend = this.formBuilder.group({
      email: ["", [Validators.required, Validators.email]],
    });
  }

  async presentPromp() {
    const alert = await this.alertController.create({
      header: "Agregar amigo",
      inputs: [
        {
          name: "email",
          type: "email",
          placeholder: "Ingresa el email de tu amigo",
        },
      ],
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          handler: () => {
            console.log("Confirm Cancel");
          },
        },
        {
          text: "enviar",
          handler: (data) => {
            this.formAddFriend.get("email").setValue(data.email);
          },
        },
      ],
    });
    await alert.present();
  }
  async presentToast(message: string, error: boolean) {
    const toast = await this.toast.create({
      message: message,
      duration: 3000,
      color: !error ? "success" : "danger",
    });
    toast.present();
  }
}
