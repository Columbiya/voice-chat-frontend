import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth-service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  authService = inject(AuthService);
  routerService = inject(Router);

  get isAuth() {
    return this.authService.isAuth;
  }

  logout() {
    this.authService.logout();
    this.routerService.navigate(['/']);
  }
}
