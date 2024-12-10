import { inject, Injectable } from '@angular/core';
import { catchError, delay, throwError } from 'rxjs';
import { ErrorService } from '../error-service/error.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ChatSocketService } from '../chat-socket-service/chat-socket.service';
import { ChatModel } from '../../models/chat.model';

@Injectable({ providedIn: 'root' })
export class ChatsService {
  private httpClient = inject(HttpClient);
  private baseUrl = 'http://localhost:3000';
  private errorService = inject(ErrorService);
  private chatSocketService = inject(ChatSocketService);

  getAll() {
    return this.httpClient
      .get<ChatModel[]>(`${this.baseUrl}/rooms`)
      .pipe(delay(2000), catchError(this.handleError.bind(this)));
  }

  joinRoom(roomId: string) {
    this.chatSocketService.emit('joinRoom', roomId);
  }

  leaveRoom() {
    this.chatSocketService.emit('leaveRoom');
  }

  private handleError(err: HttpErrorResponse) {
    this.errorService.handle(err.message);

    return throwError(() => err);
  }
}
