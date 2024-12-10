import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../../services/auth-service/auth.service';

export const authGuard: CanActivateFn = async () => {
  return inject(AuthService).isAuth();
};
