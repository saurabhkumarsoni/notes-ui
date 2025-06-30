import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-custom-dropdown',
  standalone: true,
  imports: [
    CommonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatOptionModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './custom-dropdown.html',
})
export class CustomDropdownComponent {
  @Input() label: string = 'Select';
  @Input() options: string[] = [];
  @Input() value: string | null = null;
  @Input() disabled = false;

  @Output() valueChange = new EventEmitter<string>();
}
