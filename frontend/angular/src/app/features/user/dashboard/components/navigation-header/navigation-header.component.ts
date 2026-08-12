import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
// TODO: Uncomment when language selector, theme toggle, and user profile are implemented
// import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
// TODO: Uncomment when language selector and user profile dropdown are implemented
// import { MatMenuModule } from '@angular/material/menu';

interface NavItem {
  label: string;
  path: string;
  icon?: string;
  isHome?: boolean;
}

@Component({
  selector: 'app-navigation-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    // TODO: Uncomment when needed
    // MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    // TODO: Uncomment when needed
    // MatMenuModule,
  ],
  templateUrl: './navigation-header.component.html',
  styleUrl: './navigation-header.component.scss',
})
export class NavigationHeaderComponent {
  // TODO: To be implemented with theme service
  // isDarkTheme = true;
  hasNotifications = false;

  navItems: NavItem[] = [
    { label: '', path: '/dashboard/home', icon: 'home', isHome: true },
    { label: 'Dataset', path: '/dashboard/dataset' },
    { label: 'Chat', path: '/dashboard/chat' },
    { label: 'Search', path: '/dashboard/search' },
    { label: 'Agent', path: '/dashboard/agent' },
    // { label: 'Memory', path: '/dashboard/memory' },
    { label: 'File Management', path: '/dashboard/file' },
  ];

  constructor(public router: Router) {}

  isActive(path: string): boolean {
    return this.router.url === path || this.router.url.startsWith(path + '/');
  }

  navigateToHome(): void {
    this.router.navigate(['/dashboard/home']);
  }

  // TODO: Theme Toggle - To be implemented with theme service
  // User Story: Implement theme service to manage light/dark mode
  // toggleTheme(): void {
  //   this.isDarkTheme = !this.isDarkTheme;
  // }

  // TODO: User Profile - To be implemented with auth service
  // User Story: Fetch user profile data from authentication/session service
  // getUserInitial(): string {
  //   return 'A';
  // }

  // TODO: Profile Navigation - To be implemented
  // navigateToProfile(): void {
  //   this.router.navigate(['/profile']);
  // }

  // TODO: Logout - To be implemented with auth service
  // logout(): void {
  //   this.router.navigate(['/login']);
  // }
}
