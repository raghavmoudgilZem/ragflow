import { Component, computed, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-admin-layout.component',
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
})
export class AdminLayoutComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  collapsed = false;
  username = computed(() => {
    const user = this.authService.loginUserInfo();
    return user?.nickname || user?.email || 'Admin';
  });

  toggleSidebar(): void {
    this.collapsed = !this.collapsed;
  }

  logout(): void {
    this.authService.clearSession();
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }
}
