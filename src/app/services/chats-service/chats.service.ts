import { inject, Injectable } from '@angular/core';
import { ChatModel } from '../../models/chat.model';
import { catchError, delay, Observable, throwError } from 'rxjs';
import { chats } from '../../data/chats';
import { ErrorService } from '../error-service/error.service';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ChatsService {
  // private httpClient = inject(HttpClient)
  //   private baseUrl = 'https://jsonplaceholder.typicode.com';
  private errorService = inject(ErrorService);

  getAll() {
    return new Observable<ChatModel[]>((subscriber) => {
      subscriber.next(chats);
      subscriber.complete();
    }).pipe(delay(2000), catchError(this.handleError.bind(this)));
  }

  private handleError(err: HttpErrorResponse) {
    this.errorService.handle(err.message);

    return throwError(() => err);
  }
}
