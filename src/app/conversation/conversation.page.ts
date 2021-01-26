import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { NavController } from "@ionic/angular";
import firebase from "firebase";
import { Conversation } from "../interfaces/Conversation";
import { User } from "../interfaces/User";
import { ConversationService } from "../service/conversation/conversation.service";
import { UsersService } from "../service/users/users.service";

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

  constructor(
    private router: NavController,
    private route: ActivatedRoute,
    private userService: UsersService,
    private formBuilder: FormBuilder,
    private conversationService: ConversationService
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

      this.conversationService.createConversation(this.conversation);
      this.form.reset();
    }
  }

  getConversation() {
    this.conversationService
      .getConversation(this.conversation.uid)
      .on("value", (snapshot) => {
        this.conversations = [];
        // snapshot.val() === valores
        // snapshot.key === llave del nodo
        // snapshot.forEach === recorre todo el nodo
        // snapshot.toJSON === retorn un objecto JS
        snapshot.forEach((conversation) => {
          let message = <Conversation>conversation.toJSON();
          this.conversations.push(message);
        });
      });
  }
}
