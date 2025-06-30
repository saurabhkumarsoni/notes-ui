import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UserStoreService {
  profileImage = signal<string | null>(null);

  setProfileImage(url: string) {
    this.profileImage.set(url);
  }

  clear() {
    this.profileImage.set(null);
  }
}
