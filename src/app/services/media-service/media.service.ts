import { inject, Injectable, signal } from '@angular/core';
import { ErrorService } from '../error-service/error.service';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MediaService {
  private errorService = inject(ErrorService);
  // map = new Map<userId, [LocalPeerConnection, RemotePeerConnection]>()

  private mediaTracks = signal<MediaStreamTrack[]>([]);

  localStream: MediaStream | undefined = undefined;
  private remoteStream = new MediaStream();

  private devices: MediaDeviceInfo[] | undefined = undefined;
  private videoDomElement: HTMLVideoElement | undefined = undefined;

  activeAudioInputDeviceId$ = new Subject<string>();
  activeAudioOutputDeviceId$ = new Subject<string>();

  get remoteVideoStream() {
    return this.remoteStream;
  }

  addRemoteStreamAudioTracks(track: MediaStreamTrack) {
    this.remoteStream.addTrack(track);
  }

  private isBrowserCompatible() {
    return !!window.navigator;
  }

  get audioInputDevices() {
    return this.devices?.filter(d => d.kind === 'audioinput');
  }

  get audioOutputDevices() {
    return this.devices?.filter(d => d.kind === 'audiooutput');
  }

  get videoDevices() {
    return this.devices?.filter(d => d.kind === 'videoinput');
  }

  async enableWebRTC(constraints: MediaStreamConstraints) {
    if (!this.isBrowserCompatible()) {
      this.errorService.handle("Your browser doesn't support voice chatting");
      return;
    }

    await this.getAllExistentDevices();

    try {
      const stream = await window.navigator.mediaDevices.getUserMedia(
        constraints
      );

      this.mediaTracks.set(stream.getTracks());

      this.localStream = stream;

      this.videoDomElement = document.createElement('video');
      this.videoDomElement.srcObject = this.remoteStream;
      this.videoDomElement.play();

      this.determineActiveAudioInputDevice();
      this.determineActiveAudioOutputDevice();
    } catch (e) {
      this.errorService.handle('Accept using your mic to start speaking');
    }
  }

  private determineActiveAudioInputDevice() {
    const activeDeviceId = this.audioInputDevices?.find(
      d => this.mediaTracks()[0]?.label === d.label
    )?.deviceId;

    if (activeDeviceId) {
      this.activeAudioInputDeviceId$.next(activeDeviceId);
    }
  }

  private determineActiveAudioOutputDevice() {
    const activeDeviceId = this.audioOutputDevices?.[0]?.deviceId;

    if (activeDeviceId) {
      this.activeAudioInputDeviceId$.next(activeDeviceId);
    }
  }

  clearMediaStream() {
    this.mediaTracks().forEach(track => track.stop());
  }

  async changeAudioInputDevice(deviceId: string) {
    if (!this.localStream) {
      return;
    }

    try {
      this.mediaTracks().forEach(track => track.stop());

      const newStream = await window.navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: deviceId } },
      });

      this.localStream = newStream;

      if (this.videoDomElement) {
        this.videoDomElement.srcObject = this.localStream;
        this.videoDomElement.play();
      }

      this.mediaTracks.set(this.localStream.getTracks());

      this.determineActiveAudioInputDevice();
    } catch (e) {
      if (e instanceof Error) {
        this.errorService.handle(e.message);
      }
    }
  }

  changeAudioOutputDevice(deviceId: string) {
    if (!this.localStream) {
      return;
    }

    this.videoDomElement?.setSinkId(deviceId);
  }

  async getAllExistentDevices() {
    if (!this.isBrowserCompatible()) {
      this.errorService.handle("Your browser doesn't support voice chatting");
      return;
    }

    try {
      this.devices = await window.navigator.mediaDevices.enumerateDevices();

      return this.devices;
    } catch (e) {
      this.errorService.handle('Accept using your mic to start speaking');
      throw e;
    }
  }

  async muteMic() {
    const audioTrack = this.mediaTracks().find(t => t.kind === 'audio');

    if (audioTrack) {
      audioTrack.enabled = false;
    }
  }

  async unmuteMic() {
    const audioTrack = this.mediaTracks().find(t => t.kind === 'audio');

    if (audioTrack) {
      audioTrack.enabled = true;
    }
  }
}
