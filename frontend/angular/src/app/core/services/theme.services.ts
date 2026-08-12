import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  private themeSubject = new BehaviorSubject<string>('light'); 
  public theme$ = this.themeSubject.asObservable();

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.initTheme();
  }

  private initTheme() {
    const savedTheme = localStorage.getItem('user-theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
      this.setTheme(savedTheme);
    } else if (systemDark) {
      this.setTheme('dark');
    } else {
      this.setTheme('light');
    }
  }

  setTheme(themeName: string) {
    this.themeSubject.next(themeName);
    localStorage.setItem('user-theme', themeName);
    
    this.renderer.setAttribute(document.documentElement, 'theme', themeName);
  }

  toggleTheme() {
    const current = this.themeSubject.value;
    this.setTheme(current === 'light' ? 'dark' : 'light');
  }
}