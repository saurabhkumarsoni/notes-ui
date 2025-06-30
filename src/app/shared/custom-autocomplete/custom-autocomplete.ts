import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Observable, startWith, map } from 'rxjs';

export interface Manager {
  name: string;
  position: string;
  project: string;
  image: string;
}

@Component({
  selector: 'app-custom-autocomplete',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
  ],
  templateUrl: './custom-autocomplete.html',
  styleUrls: ['./custom-autocomplete.css'],
})
export class CustomAutocompleteComponent {
  @Input() label: string = 'Select';
  @Input() placeholder: string = '';
  @Input() managers: Manager[] = [];
  @Input() selected: string = '';
  @Input() showImage: boolean = true;

  @Output() selectedChange = new EventEmitter<string | null>();
  control = new FormControl('');
  filteredManagers!: Observable<Manager[]>;

  ngOnInit(): void {
    this.control.setValue(this.selected);

    this.filteredManagers = this.control.valueChanges.pipe(
      startWith(''),
      map((value) => this.filterManagers(value || ''))
    );

    this.control.valueChanges.subscribe((value) => {
      this.selectedChange.emit(value);
    });
  }

  private filterManagers(query: string): Manager[] {
    const lower = query.toLowerCase();
    return this.managers.filter(
      (m) =>
        m.name.toLowerCase().includes(lower) ||
        m.position.toLowerCase().includes(lower) ||
        m.project.toLowerCase().includes(lower)
    );
  }
}
