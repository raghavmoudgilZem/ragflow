import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AdminLayoutComponent } from './admin-layout.component';
import { AuthService } from '../../auth/auth.service';
import { provideRouter, Router, RouterModule } from '@angular/router';
import { Component } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';

@Component({ template: '' })
class DummyComponent { }

class MockAuthService {
  loginUserInfo = vi.fn(() => ({
    id: '123',
    email: 'admin@example.com',
    nickname: 'AdminUser',
    avatar: '',
    language: 'en',
    timezone: 'UTC',
  }));
  clearSession = vi.fn();
}

describe('AdminLayoutComponent (Vitest + TestBed)', () => {
  let fixture: ComponentFixture<AdminLayoutComponent>;
  let component: AdminLayoutComponent;
  let authService: MockAuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminLayoutComponent, DummyComponent, RouterModule],
      providers: [
        provideRouter([]),
        { provide: AuthService, useClass: MockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminLayoutComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;
    router = TestBed.inject(Router);

    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should have initial collapsed state false', () => {
    expect(component.collapsed).toBe(false);
  });

  it('should toggle sidebar collapsed state', () => {
    component.toggleSidebar();
    expect(component.collapsed).toBe(true);
    component.toggleSidebar();
    expect(component.collapsed).toBe(false);
  });

  it('should evaluate computed username', () => {
    component.username();
    expect(authService.loginUserInfo).toHaveBeenCalled();
  });

  it('should return username from authService', () => {
    const username = component.username();
    expect(username).toBe('AdminUser');
  });

  it('toggleSidebar() flips collapsed state', () => {
    const initial = component.collapsed;
    component.toggleSidebar();
    expect(component.collapsed).toBe(!initial);
  });

  it('should return true when route is active', () => {
    vi.spyOn(router, 'url', 'get').mockReturnValue('/admin/users');
    const result = component.isActive('/admin/users');
    expect(result).toBe(true);
  });

  it('should return false when route is not active', () => {
    vi.spyOn(router, 'url', 'get').mockReturnValue('/admin/users');
    const result = component.isActive('/admin/service-status');
    expect(result).toBe(false);
  });

  it('should return nickname when available', () => {
    vi.spyOn(authService, 'loginUserInfo').mockReturnValue({
      id: '1',
      email: 'test@mail.com',
      nickname: 'Ragflow',
      avatar: '',
      language: 'en',
      timezone: 'UTC'
    });

    expect(component.username()).toBe('Ragflow');
  });

  it('should return email when nickname is missing', () => {
    vi.spyOn(authService, 'loginUserInfo').mockReturnValue({
      id: '1',
      email: 'email@test.com',
      nickname: '',
      avatar: '',
      language: 'en',
      timezone: 'UTC'
    });
    expect(component.username()).toBe('email@test.com');
  });

  it('should return "Admin" when no user info', () => {
    vi.spyOn(authService, 'loginUserInfo')
      .mockReturnValue(null as unknown as ReturnType<typeof authService.loginUserInfo>);
    expect(component.username()).toBe('Admin');
  });

  it('should call authService.clearSession on logout', () => {
    component.logout();
    expect(authService.clearSession).toHaveBeenCalled();
  });

  it('should render sidebar links in template', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const sidebarText = compiled.querySelector('aside')?.textContent || '';
    expect(sidebarText).toContain('Service status');
    expect(sidebarText).toContain('User management');
  });
});