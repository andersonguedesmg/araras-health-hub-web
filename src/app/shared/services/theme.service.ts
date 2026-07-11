import { DOCUMENT } from '@angular/common';
import { effect, inject, Injectable, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  readonly currentTheme = signal<ThemeMode>(this.getInitialTheme());

  constructor() {
    effect(() => {
      const mode = this.currentTheme();
      const rootElement = this.document.documentElement;

      if (mode === 'dark') {
        rootElement.classList.add('dark', 'p-dark');
      } else {
        rootElement.classList.remove('dark', 'p-dark');
      }

      localStorage.setItem('araras-theme', mode);
    });
  }

  toggleThemeCycle(): void {
    this.currentTheme.update((current) =>
      current === 'light' ? 'dark' : 'light',
    );
  }

  private getInitialTheme(): ThemeMode {
    const savedTheme = localStorage.getItem('araras-theme') as ThemeMode;
    if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
      return savedTheme;
    }

    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches;
    return prefersDark ? 'dark' : 'light';
  }
}
