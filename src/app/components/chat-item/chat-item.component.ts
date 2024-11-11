import { Component, Input } from '@angular/core';
import { ChatModel } from '../../models/chat.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-chat-item',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './chat-item.component.html',
})
export class ChatItemComponent {
  @Input() chat: ChatModel & { usersAmount: number };
}
