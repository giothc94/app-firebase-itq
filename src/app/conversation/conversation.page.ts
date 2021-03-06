import { Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { IonContent, NavController } from "@ionic/angular";
import firebase from "firebase";
import { Conversation } from "../interfaces/Conversation";
import { User } from "../interfaces/User";
import { ConversationService } from "../service/conversation/conversation.service";
import { UsersService } from "../service/users/users.service";
// natives apis
import { Vibration } from "@ionic-native/vibration/ngx";

@Component({
  selector: "app-conversation",
  templateUrl: "./conversation.page.html",
  styleUrls: ["./conversation.page.scss"],
})
export class ConversationPage implements OnInit {
  currentUserId: string;
  friend = {} as User;
  form: FormGroup;
  conversation = {} as Conversation;
  conversations: Array<Conversation>;
  @ViewChild(IonContent) content: IonContent;

  constructor(
    private router: NavController,
    private route: ActivatedRoute,
    private userService: UsersService,
    private formBuilder: FormBuilder,
    private conversationService: ConversationService,
    private vibration: Vibration
  ) {
    this.form = this.formBuilder.group({
      text: ["", Validators.required],
    });
  }

  ngOnInit() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.currentUserId = user.uid;
        this.route.params.subscribe((params) => {
          let id = params.id;
          this.userService.getUser(id).on("value", (snapshot) => {
            let friendData = snapshot.val();
            this.friend.uid = snapshot.key;
            this.friend.email = friendData.email;
            this.friend.nickname = friendData.nickname;
            this.friend.status = friendData.status;
            this.conversation.uid = [this.currentUserId, this.friend.uid]
              .sort()
              .join("|");
            this.getConversation();
          });
        });
      } else this.router.navigateRoot(["login"]);
    });
  }

  sendMessage() {
    if (this.form.valid) {
      this.conversation.text = this.form.get("text").value;
      this.conversation.timestamp = Date.now();
      this.conversation.receiver = this.friend.uid;
      this.conversation.sender = this.currentUserId;
      this.conversation.type = "text";
      this.conversationService.createConversation(this.conversation);
      this.form.reset();
    }
  }

  sendBuzz() {
    this.conversation.timestamp = Date.now();
    this.conversation.receiver = this.friend.uid;
    this.conversation.sender = this.currentUserId;
    this.conversation.type = "buzz";
    this.conversationService.createConversation(this.conversation);
  }

  doBuzz() {
    const buzz = new Audio("assets/sound/zumbido.mp3");
    this.vibration.vibrate(1000);
    buzz.play();
  }

  getConversation() {
    this.conversationService
      .getConversation(this.conversation.uid)
      .on("value", (snapshot) => {
        this.conversations = [];
        snapshot.forEach((conversation) => {
          let message = <Conversation>conversation.toJSON();
          if (
            message.type === "buzz" &&
            message.receiver === this.currentUserId
          ) {
            let minutesDateMessage = new Date(message.timestamp).getMinutes();
            let minutesCurrentDate = new Date().getMinutes();
            if (!message.read && minutesDateMessage === minutesCurrentDate) {
              this.doBuzz();
              setTimeout(() => {
                this.conversationService.buzzConversationRead(
                  this.conversation.uid,
                  message.timestamp
                );
              }, 50);
            }
          }
          this.conversations.push(message);
        });
        setTimeout(() => {
          this.goToBottom();
        }, 200);
      });
  }
  goToBottom() {
    this.content.scrollToBottom(200);
  }
}
