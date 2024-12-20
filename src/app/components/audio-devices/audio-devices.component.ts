import { Component, inject, OnInit, signal } from '@angular/core';
import { Device } from './types';
import { MediaService } from '../../services/media-service/media.service';

@Component({
  selector: 'app-audio-devices',
  standalone: true,
  imports: [],
  templateUrl: './audio-devices.component.html',
})
export class AudioDevicesComponent implements OnInit {
  // @Input() mediaTracks: MediaStreamTrack[];
  private mediaService = inject(MediaService);

  inputDevices: Device[] = [];
  outputDevices: Device[] = [];

  activeDeviceId = signal('');

  async ngOnInit() {
    // TODO костыль нужно исправить или подумать как исправить
    // этот метод вызывается в ngOnInit в ChatRoomComponent
    // а на момент как я его запрашиваю здесь его еще нет
    await this.mediaService.getAllExistentDevices();

    this.inputDevices =
      this.mediaService.audioInputDevices?.map(d => ({
        deviceId: d.deviceId,
        label: d.label,
      })) ?? [];

    this.outputDevices =
      this.mediaService.audioOutputDevices?.map(d => ({
        deviceId: d.deviceId,
        label: d.label,
      })) ?? [];

    this.mediaService.activeAudioInputDeviceId$.subscribe(nextActiveDeviceId =>
      this.activeDeviceId.set(nextActiveDeviceId)
    );
  }

  changeAudioInputDevice(deviceId: string) {
    this.mediaService.changeAudioInputDevice(deviceId);
  }

  changeAudioOutputDevice(deviceId: string) {
    this.mediaService.changeAudioOutputDevice(deviceId);
  }
}
