import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

/**
 * Agent Editor Component - Canvas-based agent/workflow editor
 * This is currently a placeholder that will be replaced with full canvas functionality
 */
@Component({
  selector: 'app-agent-editor',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './agent-editor.component.html',
  styleUrl: './agent-editor.component.scss',
})
export class AgentEditorComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  agentId = signal<string | null>(null);
  category = signal<string | null>(null);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const cat = this.route.snapshot.queryParamMap.get('category');

    this.agentId.set(id);
    this.category.set(cat);
  }

  /**
   * Navigate back to agent list
   */
  goBack(): void {
    this.router.navigate(['/dashboard/agent']);
  }
}
