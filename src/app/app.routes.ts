import { Routes } from '@angular/router';
import { ChatsComponent } from './components/chats/chats.component';
import { ChatRoomComponent } from './components/chat-room/chat-room.component';
import { AuthComponent } from './components/auth/auth.component';
import { authGuard } from './guards/auth-guard/auth.guard';

export const routes: Routes = [
  { path: 'rooms', component: ChatsComponent, canActivate: [authGuard] },
  {
    path: 'room/:chatId',
    component: ChatRoomComponent,
    canActivate: [authGuard],
  },
  { path: '**', component: AuthComponent },
];
