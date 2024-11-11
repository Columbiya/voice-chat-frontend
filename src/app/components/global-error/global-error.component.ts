import { Component, inject } from '@angular/core';
import { ErrorService } from '../../services/error-service/error.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-global-error',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './global-error.component.html',
})
export class GlobalErrorComponent {
  protected errorService = inject(ErrorService);

  close() {
    this.errorService.clear();
  }
}
