import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { EnterKeyDirective } from '../../directives/enter-key/enter-key.directive';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [ReactiveFormsModule, EnterKeyDirective],
  templateUrl: './input.component.html',
})
export class InputComponent implements OnInit {
  @Input() label: string = '';
  @Input() type: string = 'text';
  @Output() valueChange = new EventEmitter<string>();
  @Output() enterPressed = new EventEmitter();

  control = new FormControl('', Validators.required);

  ngOnInit() {
    this.control.valueChanges.subscribe(v => this.valueChange.emit(v ?? ''));
  }
}
