import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth-service/auth.service';
import { ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from '../../ui/input/input.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ReactiveFormsModule, InputComponent],
  templateUrl: './auth.component.html',
})
export class AuthComponent {
  private authService = inject(AuthService);
  private routerService = inject(Router);

  username = signal('');

  login() {
    if (!this.username()) {
      return;
    }

    this.authService.login(this.username());
    this.authService.isAuth.set(true);
    this.routerService.navigate(['/rooms']);
  }
}
