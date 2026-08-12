import { Component, input, output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { IAgent, AgentCategory } from '../../models/agent.model';
import {
  CardComponent,
  ICardData,
  ICardMenuAction,
} from '../../../../../shared/components/card/card.component';
import { DateFormatPipe } from '../../../../../shared/pipes/date-format.pipe';
import { AuthService } from '../../../../../core/auth/auth.service';

/**
 * Agent card menu action types
 * Type-safe string literals for menu actions
 */
export type AgentMenuAction = 'rename' | 'delete';

/**
 * Type-safe menu action event
 */
export interface IAgentMenuActionEvent {
  action: AgentMenuAction;
  data: ICardData;
}

/**
 * Agent-specific card component that wraps the generic Card component
 * Adds agent-specific behavior and data mapping
 */
@Component({
  selector: 'app-agent-card',
  standalone: true,
  imports: [CommonModule, CardComponent, DateFormatPipe, MatIconModule, MatButtonModule],
  templateUrl: './agent-card.component.html',
  styleUrl: './agent-card.component.scss',
})
export class AgentCardComponent {
  private readonly authService = inject(AuthService);

  // Using input signal (Angular 21 best practice)
  agent = input.required<IAgent>();

  // Keep EventEmitters for outputs (not yet signal-based in Angular 21)
  cardClick = output<IAgent>();
  rename = output<IAgent>();
  delete = output<IAgent>();

  /**
   * Show owner badge only if nickname exists and is not the current user's nickname
   */
  shouldShowOwnerBadge = computed(() => {
    const currentUserNickname = this.authService.loginUserInfo()?.nickname;
    const agentData = this.agent();
    return agentData.nickname && agentData.nickname !== currentUserNickname;
  });

  /**
   * Check if agent is a dataflow canvas type
   */
  isDataflowCanvas = computed(() => {
    const agentData = this.agent();
    return (
      agentData.canvas_category === AgentCategory.DataflowCanvas ||
      agentData.canvas_category === 'dataflow_canvas'
    );
  });

  /**
   * Map agent data to generic card data format
   */
  cardData = computed<ICardData & IAgent>(() => {
    const agentData = this.agent();
    return {
      ...agentData,
      title: agentData.title,
      description: agentData.description,
    };
  });

  /**
   * Define menu actions for agent card with type-safe action names
   */
  readonly menuActions: ICardMenuAction<AgentMenuAction>[] = [
    {
      label: 'Rename',
      icon: 'edit',
      action: 'rename',
    },
    {
      label: 'Delete',
      icon: 'delete',
      action: 'delete',
      className: 'delete-item',
    },
  ];

  /**
   * Handle menu action from generic card with type-safe action handling
   */
  onMenuAction(event: IAgentMenuActionEvent): void {
    const agentData = this.agent();

    // Type-safe exhaustive switch
    switch (event.action) {
      case 'rename':
        this.rename.emit(agentData);
        break;
      case 'delete':
        this.delete.emit(agentData);
        break;
      default: {
        // Exhaustiveness check - TypeScript will error if we miss a case
        const _exhaustiveCheck: never = event.action;
        return _exhaustiveCheck;
      }
    }
  }

  /**
   * Handle card click from generic card
   */
  onCardClick(data: ICardData): void {
    this.cardClick.emit(this.agent());
  }
}
