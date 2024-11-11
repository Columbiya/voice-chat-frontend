import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { ChatUser } from '../../models/chat-user';
import { chatUsers } from '../../data/chat-users';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorService } from '../error-service/error.service';

@Injectable({ providedIn: 'root' })
export class RoomService {
  errorService = inject(ErrorService);

  getUsersInChat(chatId: string) {
    return new Observable<ChatUser[]>(subscriber => {
      subscriber.next(chatUsers);
      subscriber.complete();
    }).pipe(catchError(err => this.handleError(err)));
  }

  getUsersAmountForChats(...chatIds: string[]) {
    return new Observable<number[]>(subscriber => {
      const userAmounts: number[] = [];

      chatIds.forEach(id =>
        this.getUsersInChat(id).subscribe(users =>
          userAmounts.push(users.length)
        )
      );

      subscriber.next(userAmounts);
      subscriber.complete();
    });
  }

  private handleError(err: HttpErrorResponse) {
    this.errorService.handle(err.message);

    return throwError(() => err);
  }
}
