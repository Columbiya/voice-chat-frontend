import { inject, Injectable, signal } from '@angular/core';
import { ErrorService } from '../error-service/error.service';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MediaService {
  private errorService = inject(ErrorService);

  private mediaTracks = signal<MediaStreamTrack[]>([]);
  private currentMediaStream: MediaStream | undefined = undefined;
  private devices: MediaDeviceInfo[] | undefined = undefined;
  private audioDomElement: HTMLAudioElement | undefined = undefined;
  activeAudioInputDeviceId$ = new Subject<string>();

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

      this.determineActiveAudioInputDevice();

      this.audioDomElement = document.createElement('audio');
      this.audioDomElement.srcObject = stream;
      this.audioDomElement.play();

      this.currentMediaStream = stream;
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

  clearMediaStream() {
    this.mediaTracks().forEach(track => track.stop());
  }

  async changeAudioInputDevice(deviceId: string) {
    if (!this.currentMediaStream) {
      return;
    }

    try {
      this.mediaTracks().forEach(track => track.stop());

      const newStream = await window.navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: deviceId } },
      });

      this.currentMediaStream = newStream;

      if (this.audioDomElement) {
        this.audioDomElement.srcObject = this.currentMediaStream;
        this.audioDomElement.play();
      }

      this.mediaTracks.set(this.currentMediaStream.getTracks());

      this.determineActiveAudioInputDevice();
    } catch (e) {
      if (e instanceof Error) {
        this.errorService.handle(e.message);
      }
    }
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
