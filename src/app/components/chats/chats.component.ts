import { Component, inject, OnInit, signal } from '@angular/core';
import { ChatsService } from '../../services/chats-service/chats.service';
import { ChatModel } from '../../models/chat.model';
import { ChatItemComponent } from '../chat-item/chat-item.component';
import { RoomService } from '../../services/room-service/room.service';

@Component({
  selector: 'app-chats',
  standalone: true,
  imports: [ChatItemComponent],
  templateUrl: './chats.component.html',
})
export class ChatsComponent implements OnInit {
  chatsService = inject(ChatsService);
  roomService = inject(RoomService);
  loading = signal(true);

  chats = signal<(ChatModel & { usersAmount: number })[]>([]);

  ngOnInit() {
    this.chatsService.getAll().subscribe(chats => {
      let userAmounts: number[] = [];

      this.roomService
        .getUsersAmountForChats(...chats.map(c => c.id))
        .subscribe(am => (userAmounts = am));

      this.chats.set(
        chats.map((chat, i) => ({ ...chat, usersAmount: userAmounts[i] ?? 0 }))
      );
      this.loading.set(false);
    });
  }
}
