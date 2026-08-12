import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/services/theme.services'; 

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="dummy-header">
      <div class="logo-area">
        <h3>🚀 RAGFlow Test Header</h3>
      </div>
      
      <button class="theme-toggle" (click)="toggleTheme()">
        {{ isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode' }}
      </button>
    </header>
  `,
  styles: [`
    .dummy-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      /* Using our CSS variables! */
      background-color: var(--bg-surface);
      color: var(--text-main);
      border-bottom: 1px solid var(--border-color);
      transition: background-color 0.3s, color 0.3s;
    }

    .theme-toggle {
      padding: 8px 16px;
      border-radius: 6px;
      border: 1px solid var(--border-color);
      background-color: var(--bg-body);
      color: var(--text-main);
      cursor: pointer;
      font-weight: bold;
      transition: all 0.2s;
    }
    
    .theme-toggle:hover {
      background-color: var(--primary-color);
      color: white;
    }
  `]
})
export class HeaderComponent {
  isDarkMode = false;

  constructor(private themeService: ThemeService) {
    // Listen to the theme state so the button text updates correctly
    this.themeService.theme$.subscribe(theme => {
      this.isDarkMode = theme === 'dark';
    });
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}