import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ChatUser } from '../../models/chat-user';
import { RoomService } from '../../services/room-service/room.service';
import { ActivatedRoute } from '@angular/router';
import { ChatUserComponent } from '../chat-user/chat-user.component';
import { AuthService } from '../../services/auth-service/auth.service';
import { AudioDevicesComponent } from '../audio-devices/audio-devices.component';
import { MediaService } from '../../services/media-service/media.service';
import { ChatSocketService } from '../../services/chat-socket-service/chat-socket.service';

@Component({
  selector: 'app-chat-room',
  standalone: true,
  imports: [ChatUserComponent, AudioDevicesComponent],
  templateUrl: './chat-room.component.html',
})
export class ChatRoomComponent implements OnInit, OnDestroy {
  chatId: string;

  roomService = inject(RoomService);
  authService = inject(AuthService);
  private mediaService = inject(MediaService);
  private chatSocketService = inject(ChatSocketService);

  chatUsers = signal<ChatUser[]>([]);

  loading = signal(true);
  isMicOn = signal(false);

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.chatId = this.route.snapshot.paramMap.get('chatId') ?? '';
    this.chatSocketService.emit('joinRoom', this.chatId);

    this.roomService.roomId.set(this.chatId);

    this.roomService.getUsersInChat(this.chatId).subscribe(roomWithUsers => {
      this.chatUsers.set([
        ...roomWithUsers.users.map(u => ({ id: u.userId, name: u.username })),
        { id: Date.now().toString(), name: this.authService.username() ?? '' },
      ]);
      this.loading.set(false);
    });

    this.enableMic();
  }

  ngOnDestroy() {
    this.mediaService.clearMediaStream();
  }

  private async enableMic() {
    await this.mediaService.enableWebRTC({ audio: true });
    this.mediaService.muteMic();
  }

  toggleMic() {
    if (this.isMicOn()) {
      this.mediaService.muteMic();
      this.chatSocketService.emit('muted');
      this.isMicOn.set(false);
    } else {
      this.mediaService.unmuteMic();
      this.chatSocketService.emit('unmuted');
      this.isMicOn.set(true);
    }
  }
}
