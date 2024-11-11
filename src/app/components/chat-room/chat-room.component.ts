import {
  Component,
  inject,
  Input,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { ChatUser } from '../../models/chat-user';
import { RoomService } from '../../services/room-service/room.service';
import { ActivatedRoute } from '@angular/router';
import { ChatUserComponent } from '../chat-user/chat-user.component';
import { AuthService } from '../../services/auth-service/auth.service';
import { AudioDevicesComponent } from '../audio-devices/audio-devices.component';
import { MediaService } from '../../services/media-service/media.service';

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

  chatUsers = signal<ChatUser[]>([]);
  loading = signal(true);
  isMicOn = signal(false);

  constructor(private route: ActivatedRoute) {}

  async ngOnInit() {
    this.chatId = this.route.snapshot.paramMap.get('chatId') ?? '';

    this.roomService.getUsersInChat(this.chatId).subscribe(users => {
      this.chatUsers.set([
        ...users,
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
      this.isMicOn.set(false);
    } else {
      this.mediaService.unmuteMic();
      this.isMicOn.set(true);
    }
  }
}
