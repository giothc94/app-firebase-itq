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
import { FriendRequestService } from "../service/FriendRequest/friend-request.service";
import { FriendRequest } from "../interfaces/FriendRequest";
@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"],
})
export class HomePage {
  user = {} as User;
  friends = [];
  friendRequests = [];
  formAddFriend: FormGroup;

  constructor(
    private menu: MenuController,
    private userService: UsersService,
    private router: NavController,
    public alertController: AlertController,
    private formBuilder: FormBuilder,
    public toast: ToastController,
    private friendRequestService: FriendRequestService
  ) {
    this.menu.enable(true);
    firebase.auth().onAuthStateChanged((currentUser) => {
      if (currentUser) {
        this.userService.getUser(currentUser.uid).on("value", (snapshot) => {
          const data = snapshot.val();
          this.user.uid = snapshot.key;
          this.user.email = data.email;
          this.user.nickname = data.nickname;
          this.user.status = data.status;
          this.friendRequestService
            .getRequestByEmail(this.user.email)
            .on("value", (snapshot) => {
              this.friendRequests = [];
              snapshot.forEach((request) => {
                this.friendRequests.push(request.val());
              });
            });
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
            this.sendRequest();
          },
        },
      ],
    });
    await alert.present();
  }
  async presentRequest(request: FriendRequest) {
    const alert = await this.alertController.create({
      header: `Solicitud de amistad de ${request.sender.nickname}`,
      message: "¿ Aceptar solicitud de amistad ?",
      buttons: [
        {
          text: "Rechazar",
          handler: () => {
            this.presentToast("Solicitud rechazada", true);
          },
        },
        {
          text: "Aceptar",
          handler: () => {
            this.addFriend(request);
          },
        },
      ],
    });

    await alert.present();
  }
  addFriend(request: FriendRequest) {
    this.friendRequestService
      .addFriend(request, this.user)
      .then(() => {
        this.presentToast("Solicitud aceptada", false);
      })
      .catch((error) => {
        console.error(error);
      });
  }
  sendRequest() {
    if (this.formAddFriend.get("email").value === this.user.email) {
      this.presentToast("Solicitud NO enviada", true);
    } else {
      if (this.formAddFriend.valid) {
        let request = {} as FriendRequest;
        request.receiverEmail = this.formAddFriend.get("email").value;
        request.sender = this.user;
        request.timestamp = Date.now();
        request.status = "pending";
        this.friendRequestService
          .createRequest(request)
          .then(() => {
            this.presentToast("Solicitud enviada", false);
          })
          .catch((error) => {
            console.error(error);
          });
      }
    }
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
