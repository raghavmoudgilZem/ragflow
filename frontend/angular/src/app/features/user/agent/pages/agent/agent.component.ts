import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, finalize, startWith } from 'rxjs';
import { AgentCardComponent } from '../../components/agent-card/agent-card.component';
import { AgentService } from '../../services/agent.service';
import { IAgent } from '../../models/agent.model';
import { AGENT_CONFIG } from '../../constants/agent.constants';

@Component({
  selector: 'app-agent',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule, AgentCardComponent],
  templateUrl: './agent.component.html',
  styleUrl: './agent.component.scss',
})
export class AgentComponent implements OnInit {
  private readonly agentService = inject(AgentService);
  private readonly router = inject(Router);

  agents$!: Observable<IAgent[]>;
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadAgents();
  }

  /**
   * Load agents from the service using async pipe pattern
   */
  loadAgents(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null); // Clear previous errors
    this.agents$ = this.agentService
      .getAgents({
        page: AGENT_CONFIG.API.DEFAULT_PAGE,
        page_size: AGENT_CONFIG.API.DEFAULT_PAGE_SIZE,
        orderby: AGENT_CONFIG.API.DEFAULT_ORDER_BY,
        desc: AGENT_CONFIG.API.DEFAULT_DESC,
      })
      .pipe(
        map((response) => {
          if (response.code !== 0) {
            throw new Error(response.message || 'Failed to load agents');
          }
          return response.data;
        }),
        startWith([]), // Emit empty array immediately so async pipe subscribes
        catchError((error) => {
          this.errorMessage.set(error.message || 'Failed to load agents. Please try again later.');
          return of([]);
        }),
        finalize(() => this.isLoading.set(false)),
      );
  }

  /**
   * Handle card click to navigate to agent editor
   */
  onCardClick(agent: IAgent): void {
    this.router.navigate(['/dashboard/agent', agent.id], {
      queryParams: { category: agent.canvas_category },
    });
  }

  /**
   * Handle rename agent
   * TODO: Implement rename dialog
   */
  onRenameAgent(agent: IAgent): void {
    // Will be implemented with rename dialog
  }

  /**
   * Handle delete agent
   * TODO: Implement delete confirmation dialog
   */
  onDeleteAgent(agent: IAgent): void {
    // Will be implemented with delete confirmation dialog
  }
}
