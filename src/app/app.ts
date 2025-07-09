import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReminderService } from './services/reminder.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected title = 'notes-ui';

  constructor(
    private router: Router,
    private reminderService: ReminderService
  ) {}

  shouldShowNavbar(): boolean {
    return !['/login', '/register'].includes(this.router.url);
  }

  ngOnInit(): void {
    this.reminderService.startReminderPolling();
  }
}
