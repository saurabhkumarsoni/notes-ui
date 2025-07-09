import { Injectable } from '@angular/core';
import { interval, switchMap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoteService } from './note'; // ✅ Make sure service name is correct
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ReminderService {
  constructor(
    private notesService: NoteService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  startReminderPolling() {
    interval(60000) // every 60 seconds
      .pipe(switchMap(() => this.notesService.getDueReminders())) // returns { due, upcoming }
      .subscribe(({ due, upcoming }) => {
        [...due, ...upcoming].forEach((note) => {
          if (
            'Notification' in window &&
            Notification.permission === 'granted'
          ) {
            const timeLabel = due.includes(note) ? 'Now' : 'Soon';
            new Notification(`⏰ Reminder (${timeLabel}): ${note.name}`, {
              body: note.content,
            });
          }

          this.snackBar
            .open(`⏰ ${note.name}`, 'View', { duration: 10000 })
            .onAction()
            .subscribe(() => {
              this.router.navigate(['/notes', note.id]);
            });
        });
      });
  }
}
