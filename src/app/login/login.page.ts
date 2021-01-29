import { Component, OnInit } from "@angular/core";
import { MenuController, NavController, ToastController } from "@ionic/angular";
import { AuthService } from "../service/auth/auth.service";
import firebase from "firebase";
import { User } from "../interfaces/User";
import { Validators, FormGroup, FormBuilder } from "@angular/forms";
import { CustomValidators } from "src/utils/CustomValidators";
import { Camera, CameraOptions } from "@ionic-native/camera/ngx";
@Component({
  selector: "app-login",
  templateUrl: "./login.page.html",
  styleUrls: ["./login.page.scss"],
})
export class LoginPage implements OnInit {
  loginFlag: boolean = true;
  user = {} as User;
  loginForm: FormGroup;
  registerForm: FormGroup;

  constructor(
    private menu: MenuController,
    private auth: AuthService,
    public toast: ToastController,
    private router: NavController,
    private formBuilder: FormBuilder,
    private camera: Camera
  ) {
    this.buildForm();
  }

  ngOnInit() {
    this.menu.enable(false);
    firebase.auth().onAuthStateChanged((user) => {
      if (user) this.router.navigateRoot(["home"]);
    });
  }

  private buildForm() {
    this.loginForm = this.formBuilder.group({
      email: [
        "",
        [Validators.required, Validators.email, Validators.minLength(4)],
      ],
      password: ["", [Validators.required]],
      status: ["Conectado", [Validators.required]],
    });
    this.registerForm = this.formBuilder.group(
      {
        nickname: ["", [Validators.required, Validators.maxLength(15)]],
        email: ["", [Validators.required, Validators.email]],
        password: ["", [Validators.required, Validators.minLength(6)]],
        confirmPassword: ["", [Validators.required]],
      },
      {
        validators: [CustomValidators.confirmPassword],
      }
    );
  }
  async checkin() {
    if (this.registerForm.valid) {
      try {
        this.user.email = this.email.value;
        this.user.nickname = this.nickname.value;
        this.user.password = this.password.value;
        this.user.status = this.status.value;
        let user = await this.auth.checkin(this.user);
        this.presentToast(
          `Usuario ${user.nickname} registrado exitosamente`,
          2000,
          false
        );
        this.loginFlag = true;
      } catch (error) {
        this.presentToast(error.message, 2000, true);
        console.error(error);
      }
    }
  }

  async login() {
    try {
      this.user.email = this.email.value;
      this.user.password = this.password.value;
      this.user.status = this.status.value;
      let user: firebase.User = await this.auth.login(
        this.user.email,
        this.user.password,
        this.user.status
      );
      this.presentToast(`Ingreso de ${user.email} exitoso`, 3000, false);
      setTimeout(() => {
        this.router.navigateRoot(["home"]);
      }, 3000);
    } catch (error) {
      this.presentToast(error.message, 3000, true);
      console.error(error);
    }
  }

  async getPicture(source: string) {
    try {
      const options: CameraOptions = {
        quality: 100,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE,
        sourceType:
          source === "camera"
            ? this.camera.PictureSourceType.CAMERA
            : this.camera.PictureSourceType.PHOTOLIBRARY,
      };
      let imageData = await this.camera.getPicture(options);
      let base64Image = `data:image/jpeg;base64,${imageData}`;
    } catch (error) {
      console.error(error);
    }
  }

  // getter
  get email() {
    if (this.loginFlag) return this.loginForm.get("email");
    else return this.registerForm.get("email");
  }
  get password() {
    if (this.loginFlag) return this.loginForm.get("password");
    else return this.registerForm.get("password");
  }
  get status() {
    return this.loginForm.get("status");
  }
  get nickname() {
    return this.registerForm.get("nickname");
  }
  get confirmPassword() {
    return this.registerForm.get("confirmPassword");
  }

  // utils
  async presentToast(message: string, time: number, error: boolean) {
    const toast = await this.toast.create({
      message: message,
      duration: time,
      color: !error ? "success" : "warning",
    });
    toast.present();
  }
}
