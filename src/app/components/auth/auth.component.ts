import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth-service/auth.service';
import { ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from '../../ui/input/input.component';
import { Router } from '@angular/router';
import { ChatSocketService } from '../../services/chat-socket-service/chat-socket.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ReactiveFormsModule, InputComponent],
  templateUrl: './auth.component.html',
})
export class AuthComponent {
  private authService = inject(AuthService);
  private chatSocketService = inject(ChatSocketService);
  private routerService = inject(Router);

  username = signal('');

  login() {
    if (!this.username()) {
      return;
    }

    this.authService.login(this.username());
    this.chatSocketService.emit('auth', this.username());
    this.routerService.navigate(['/rooms']);
  }
}
