import {
  Component,
  EventEmitter,
  Input,
  Output,
  ContentChild,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';

/**
 * Base interface for card data
 * Extend this interface for specific card types
 */
export interface ICardData {
  id: string;
  title: string;
  description?: string;
  avatar?: string;
  update_time?: string | number;
  [key: string]: unknown; // Allow additional properties
}

/**
 * Menu action interface
 * Generic type parameter allows type-safe action strings
 * @template TAction - Type of action string (use string literals for type safety)
 */
export interface ICardMenuAction<TAction extends string = string> {
  label: string;
  icon: string;
  className?: string;
  action: TAction;
}

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatMenuModule],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent<T extends ICardData = ICardData, TAction extends string = string> {
  @ViewChild(MatMenuTrigger) menuTrigger?: MatMenuTrigger;

  /**
   * Card data - generic type that extends ICardData
   */
  @Input({ required: true }) data!: T;

  /**
   * Menu actions to display in the dropdown
   */
  @Input() menuActions: ICardMenuAction<TAction>[] = [];

  /**
   * Whether to show the menu button
   */
  @Input() showMenu = true;

  /**
   * Custom avatar template
   * Note: Also supports content projection via <ng-content select="[avatar]">
   * Reserved for future customization. Currently unused.
   */
  @ContentChild('avatarTemplate') avatarTemplate?: TemplateRef<{ data: T }>;

  /**
   * Emits when the card is clicked
   */
  @Output() cardClick = new EventEmitter<T>();

  /**
   * Emits when a menu action is triggered
   * Payload includes action name and data
   */
  @Output() menuAction = new EventEmitter<{ action: TAction; data: T }>();

  /**
   * Check if custom avatar content is provided
   */
  hasAvatarContent(): boolean {
    return !!this.avatarTemplate;
  }

  /**
   * Handle card click
   */
  onCardClick(): void {
    this.cardClick.emit(this.data);
  }

  /**
   * Handle menu action click
   */
  onMenuAction(event: Event, action: TAction): void {
    event.stopPropagation();
    this.menuTrigger?.closeMenu();
    this.menuAction.emit({ action, data: this.data });
  }

  /**
   * Handle menu button click (prevent card click)
   */
  onMenuClick(event: Event): void {
    event.stopPropagation();
  }

  /**
   * Handle keyboard interaction
   */
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onCardClick();
    }
  }

  /**
   * Get initials from title for avatar fallback
   */
  getInitials(): string {
    if (!this.data.title) return '?';

    const words = this.data.title.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return this.data.title.substring(0, 2).toUpperCase();
  }
}
