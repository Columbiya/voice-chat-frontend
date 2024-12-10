import { inject, Injectable, signal } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorService } from '../error-service/error.service';
import { RoomWithUsersDTO } from '../../dtos/room-with-users.dto';
import { ChatUser } from '../../models/chat-user';

@Injectable({ providedIn: 'root' })
export class RoomService {
  errorService = inject(ErrorService);

  private httpClient = inject(HttpClient);
  private baseUrl = 'http://localhost:3000';

  chatUsers = signal<ChatUser[]>([]);
  roomId = signal('');

  getUsersInChat(chatId: string) {
    return this.httpClient
      .get<RoomWithUsersDTO>(`${this.baseUrl}/rooms/${chatId}`)
      .pipe(
        tap(dto =>
          this.chatUsers.set(
            dto.users.map(u => ({ id: u.userId, name: u.username }))
          )
        )
      )
      .pipe(catchError(err => this.handleError(err)));
  }

  addPersonToRoom(personId: string, name: string) {
    this.chatUsers.update(prev => [...prev, { id: personId, name }]);
  }

  private handleError(err: HttpErrorResponse) {
    this.errorService.handle(err.message);

    return throwError(() => err);
  }
}
