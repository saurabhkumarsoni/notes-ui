import { AuthService } from './../../services/auth.service';
import { Component, OnInit, inject, isDevMode } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { PLATFORM_ID, Inject } from '@angular/core';
import { UserService } from '../../services/user.service';
import { UserStoreService } from '../../services/user-store.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
})
export class Navbar implements OnInit {
  userName: string | null = null;
  defaultAvatar = 'https://www.gravatar.com/avatar/?d=mp';
  menuOpen = false;

  constructor(
    private router: Router,
    private auth: AuthService,
    private userService: UserService,
    public userStore: UserStoreService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    const user = this.auth.getUser();
    this.userName = user?.firstName || 'User';

    if (user?.id) {
      this.userService.getUserById(user.id).subscribe({
        next: (res) => {
          this.userStore.setProfileImage(res.profileImage); // sync at startup
        },
        error: (err) => {
          console.error('❌ Failed to fetch user profile image', err);
        },
      });
    }
  }

  get profileImage() {
    return this.userStore.profileImage() || this.defaultAvatar;
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  goToProfile(): void {
    this.menuOpen = false;
    this.router.navigate(['/user-profile']);
  }

  logout(): void {
    this.menuOpen = false;
    if (isPlatformBrowser(this.platformId)) {
      this.auth.clearTokens();
    }
    this.router.navigate(['/login']);
  }
}
