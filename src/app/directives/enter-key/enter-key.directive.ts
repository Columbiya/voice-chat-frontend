import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
} from '@angular/core';

@Directive({
  selector: '[appEnterKey]',
  standalone: true,
})
export class EnterKeyDirective {
  constructor(private el: ElementRef) {}

  @Output() enterPressed = new EventEmitter();

  @HostListener('keyup', ['$event']) onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.enterPressed.emit();
    }
  }
}
