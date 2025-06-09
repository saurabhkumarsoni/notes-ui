import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Notes } from './components/notes/notes';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Notes],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'notes-ui';
}
