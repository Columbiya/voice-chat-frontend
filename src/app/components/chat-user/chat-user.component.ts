import { Component, Input } from '@angular/core';
import { ChatUser } from '../../models/chat-user';

@Component({
  selector: 'app-chat-user',
  standalone: true,
  imports: [],
  templateUrl: './chat-user.component.html',
})
export class ChatUserComponent {
  @Input() user: ChatUser;
}
