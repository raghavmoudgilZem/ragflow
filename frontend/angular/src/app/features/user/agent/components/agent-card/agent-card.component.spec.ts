import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgentCardComponent, IAgentMenuActionEvent } from './agent-card.component';
import { IAgent, AgentCategory, TenantPermission } from '../../models/agent.model';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from '../../../../../core/auth/auth.service';
import { signal } from '@angular/core';

describe('AgentCardComponent', () => {
  let component: AgentCardComponent;
  let fixture: ComponentFixture<AgentCardComponent>;
  let mockAuthService: any;

  const mockAgent: IAgent = {
    id: 'test-agent-1',
    title: 'Test Agent',
    description: 'This is a test agent description',
    avatar: '',
    create_date: '2026-03-12',
    create_time: 1740000000000,
    update_date: '2026-03-12',
    update_time: 1740000000000,
    user_id: 'user-1',
    nickname: 'Test User',
    canvas_type: null,
    canvas_category: AgentCategory.Agent,
    permission: TenantPermission.ME,
  };

  beforeEach(async () => {
    mockAuthService = {
      loginUserInfo: signal({
        id: 'current-user-id',
        nickname: 'Current User',
        email: 'current@test.com',
        avatar: '',
      }),
    };

    await TestBed.configureTestingModule({
      imports: [AgentCardComponent],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compileComponents();

    fixture = TestBed.createComponent(AgentCardComponent);
    component = fixture.componentInstance;
    // Use setInput for signal-based inputs
    fixture.componentRef.setInput('agent', mockAgent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display agent title via cardData computed signal', () => {
    const cardData = component.cardData();
    expect(cardData.title).toBe('Test Agent');
  });

  it('should display agent description via cardData computed signal', () => {
    const cardData = component.cardData();
    expect(cardData.description).toBe('This is a test agent description');
  });

  it('should display owner nickname in badge when nickname exists and is different from current user', () => {
    const compiled = fixture.nativeElement;
    const ownerBadge = compiled.querySelector('.owner-badge');
    expect(ownerBadge).toBeTruthy();
    expect(ownerBadge.textContent.trim()).toBe('Test User');
  });

  it('should not display owner badge when nickname is empty', () => {
    fixture.componentRef.setInput('agent', { ...mockAgent, nickname: '' });
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const ownerBadge = compiled.querySelector('.owner-badge');
    expect(ownerBadge).toBeFalsy();
  });

  it('should not display owner badge when nickname matches current user', () => {
    fixture.componentRef.setInput('agent', { ...mockAgent, nickname: 'Current User' });
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    const ownerBadge = compiled.querySelector('.owner-badge');
    expect(ownerBadge).toBeFalsy();
  });

  it('should display update timestamp', () => {
    const compiled = fixture.nativeElement;
    const timestamp = compiled.querySelector('.timestamp');
    expect(timestamp).toBeTruthy();
    expect(timestamp.textContent).toBeTruthy();
  });

  it('should emit cardClick event when onCardClick is called', () => {
    const emitSpy = vi.spyOn(component.cardClick, 'emit');
    component.onCardClick(component.cardData());
    expect(emitSpy).toHaveBeenCalledWith(mockAgent);
  });

  it('should emit rename event when rename menu action is triggered', () => {
    const emitSpy = vi.spyOn(component.rename, 'emit');
    const event: IAgentMenuActionEvent = { action: 'rename', data: component.cardData() };
    component.onMenuAction(event);
    expect(emitSpy).toHaveBeenCalledWith(mockAgent);
  });

  it('should emit delete event when delete menu action is triggered', () => {
    const emitSpy = vi.spyOn(component.delete, 'emit');
    const event: IAgentMenuActionEvent = { action: 'delete', data: component.cardData() };
    component.onMenuAction(event);
    expect(emitSpy).toHaveBeenCalledWith(mockAgent);
  });

  it('should return correct menu actions', () => {
    const menuActions = component.menuActions;
    expect(menuActions).toHaveLength(2);
    expect(menuActions[0].action).toBe('rename');
    expect(menuActions[0].label).toBe('Rename');
    expect(menuActions[0].icon).toBe('edit');
    expect(menuActions[1].action).toBe('delete');
    expect(menuActions[1].label).toBe('Delete');
    expect(menuActions[1].icon).toBe('delete');
    expect(menuActions[1].className).toBe('delete-item');
  });

  it('should include all agent properties in cardData', () => {
    const cardData = component.cardData();
    expect(cardData.id).toBe(mockAgent.id);
    expect(cardData.user_id).toBe(mockAgent.user_id);
    expect(cardData.nickname).toBe(mockAgent.nickname);
    expect(cardData.canvas_category).toBe(mockAgent.canvas_category);
  });
});
