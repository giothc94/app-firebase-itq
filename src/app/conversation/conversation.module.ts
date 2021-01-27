import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { ConversationPageRoutingModule } from "./conversation-routing.module";

import { ConversationPage } from "./conversation.page";
// native apis
import { Vibration } from "@ionic-native/vibration/ngx";

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    ConversationPageRoutingModule,
  ],
  declarations: [ConversationPage],
  providers: [Vibration],
})
export class ConversationPageModule {}
