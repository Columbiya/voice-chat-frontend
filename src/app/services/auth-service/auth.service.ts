import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  isAuth = signal(false);
  username = signal<undefined | string>(undefined);

  login(username: string) {
    this.username.set(username);
    this.isAuth.set(true);
  }

  logout() {
    this.isAuth.set(false);
    this.username.set(undefined);
  }
}
