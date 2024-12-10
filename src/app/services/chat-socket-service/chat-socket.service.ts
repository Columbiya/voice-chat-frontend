import { inject, Injectable, signal } from '@angular/core';
import { io } from 'socket.io-client';
import { ClientToServerEvents, ServerToClientEvents, Socket } from './types';
import { Socket as SocketIO } from 'socket.io-client';
import { MediaService } from '../media-service/media.service';
import { RoomService } from '../room-service/room.service';

@Injectable({ providedIn: 'root' })
export class ChatSocketService {
  private socket: Socket;
  private socketUrl = 'http://localhost:3000';

  private muted = signal<string[]>([]);
  private speaking = signal<string[]>([]);

  private mediaService = inject(MediaService);
  private roomService = inject(RoomService);

  pc: RTCPeerConnection;

  constructor() {
    this.socket = io(this.socketUrl) as SocketIO<
      ClientToServerEvents,
      ServerToClientEvents
    >;

    this.setupListeners();
  }

  private createPeerConnection(): RTCPeerConnection {
    const pc = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            'stun:stun.1.google.com:19302',
            'stun:stun2.1.google.com:19302',
          ],
        },
      ],
      iceCandidatePoolSize: 10,
    });

    this.mediaService.localStream
      ?.getTracks()
      .forEach(
        track =>
          this.mediaService.localStream &&
          pc.addTrack(track, this.mediaService.localStream)
      );

    pc.ontrack = ev => {
      ev.streams[0].getTracks().forEach(track => {
        this.mediaService.addRemoteStreamAudioTracks(track);
      });
    };

    pc.onicecandidate = ev => {
      if (ev.candidate) {
        this.emit(
          'sendIceCandidates',
          this.roomService.roomId(),
          JSON.stringify(ev.candidate.toJSON())
        );
      }
    };

    return pc;
  }

  async sendOffer(roomId: string, userId: string) {
    this.pc = this.createPeerConnection();

    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);

    this.emit('sendOffer', roomId, userId, offer.sdp ?? '', offer.type);
  }

  emit(
    event: keyof ClientToServerEvents,
    ...payload: Parameters<ClientToServerEvents[typeof event]>
  ) {
    this.socket.emit(event, ...payload);
  }

  private setupListeners() {
    this.socket.on('personMutedTheirMic', userId => {
      this.muted.update(prev => [...prev, userId]);
    });

    this.socket.on('personUnmutedTheirMic', userId => {
      this.muted.update(prev => prev.filter(uid => uid !== userId));
    });

    this.socket.on('personSendingIceCandidates', (userId, iceCandidateJson) => {
      try {
        const candidate = JSON.parse(iceCandidateJson) as RTCIceCandidate;

        this.pc.addIceCandidate(candidate);
      } catch (e) {
        console.log(e);
      }
    });

    this.socket.on('personSendingRtcAnswer', async (roomId, userId, sdp) => {
      if (!this.pc.currentRemoteDescription) {
        this.pc.setRemoteDescription(
          new RTCSessionDescription({ sdp, type: 'answer' })
        );
      }
    });

    this.socket.on('personJoinedRoom', (personId, name) => {
      this.roomService.addPersonToRoom(personId, name);

      this.sendOffer(this.roomService.roomId(), personId);
    });

    this.socket.on(
      'personSendingRtcOffer',
      async (roomId, userId, sdp, type) => {
        try {
          if (!this.pc) {
            this.pc = this.createPeerConnection();
          }

          const d = new RTCSessionDescription({
            sdp,
            type: type as RTCSdpType,
          });
          this.pc.setRemoteDescription(d);

          const answer = await this.pc.createAnswer();
          this.pc.setLocalDescription(answer);

          this.socket.emit(
            'sendAnswer',
            roomId,
            userId,
            answer.sdp ?? '',
            answer.type
          );
        } catch (e) {
          console.log(e);
        }
      }
    );

    this.socket.on('personDoneSpeaking', userId => {
      this.speaking.update(prev => prev.filter(uid => uid !== userId));
    });
  }
}
