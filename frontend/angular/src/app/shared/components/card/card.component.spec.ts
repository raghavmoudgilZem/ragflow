import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardComponent } from './card.component';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    component.data = {
      id: '1',
      title: 'Test Card',
      description: 'Test Description',
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display card title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.card-title')?.textContent).toContain('Test Card');
  });

  it('should emit cardClick when card is clicked', () => {
    const emitSpy = vi.spyOn(component.cardClick, 'emit');
    component.onCardClick();
    expect(emitSpy).toHaveBeenCalledWith(component.data);
  });

  it('should emit menuAction when menu item is clicked', () => {
    const emitSpy = vi.spyOn(component.menuAction, 'emit');
    const event = new Event('click');
    component.onMenuAction(event, 'delete');
    expect(emitSpy).toHaveBeenCalledWith({
      action: 'delete',
      data: component.data,
    });
  });

  it('should get initials from title', () => {
    component.data = { id: '1', title: 'Test Card' };
    expect(component.getInitials()).toBe('TC');
  });
});
