import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, throwError } from 'rxjs';
import {
  IAgent,
  IAgentListResponse,
  IAgentResponse,
  IAgentPaginationParams,
} from '../models/agent.model';
import { environment } from '../../../../../environments/environment';
import { AGENT_CONFIG } from '../constants/agent.constants';
import { MOCK_AGENTS } from '../data/mock-agents.data';

@Injectable({
  providedIn: 'root',
})
export class AgentService {
  private readonly API_BASE = `${environment.apiUrl}/agent`;

  // Mock data for development - will be replaced with actual API calls
  private mockAgents: IAgent[] = [...MOCK_AGENTS];

  constructor(private readonly http: HttpClient) {}

  /**
   * Fetch paginated list of agents
   */
  getAgents(params: IAgentPaginationParams): Observable<IAgentListResponse> {
    // TODO: Replace mock data with actual API call
    // const httpParams = new HttpParams()
    //   .set('page', params.page.toString())
    //   .set('page_size', params.page_size.toString())
    //   .set('orderby', params.orderby || 'create_time')
    //   .set('desc', params.desc !== false ? 'true' : 'false');
    //
    // return this.http.get<IAgentListResponse>(`${this.API_BASE}/list`, { params: httpParams });

    // Mock response for development
    return of({
      code: 0,
      data: this.mockAgents,
      message: 'Success',
    }).pipe(delay(AGENT_CONFIG.API.MOCK_DELAY_MS));
  }

  /**
   * Get a single agent by ID
   */
  getAgentById(id: string): Observable<IAgentResponse> {
    // TODO: Replace with actual API call
    // return this.http.get<IAgentResponse>(`${this.API_BASE}/${id}`);

    const agent = this.mockAgents.find((a) => a.id === id);
    if (!agent) {
      return throwError(() => new Error('Agent not found'));
    }
    return of({
      code: 0,
      data: agent,
      message: 'Success',
    }).pipe(delay(300));
  }

  /**
   * Create a new agent
   */
  createAgent(agent: Partial<IAgent>): Observable<IAgentResponse> {
    // TODO: Replace with actual API call
    // return this.http.post<IAgentResponse>(this.API_BASE, agent);

    const newAgent: IAgent = {
      id: `agent-${Date.now()}`,
      title: agent.title || 'New Agent',
      description: agent.description,
      avatar: agent.avatar || '',
      create_date: new Date().toISOString().split('T')[0],
      create_time: Date.now(),
      update_date: new Date().toISOString().split('T')[0],
      update_time: Date.now(),
      user_id: 'user-1',
      nickname: 'Current User',
      canvas_type: null,
      canvas_category: 'agent',
      permission: 'me',
    };

    this.mockAgents.push(newAgent);

    return of({
      code: 0,
      data: newAgent,
      message: 'Agent created successfully',
    }).pipe(delay(300));
  }

  /**
   * Update an existing agent
   */
  updateAgent(id: string, updates: Partial<IAgent>): Observable<IAgentResponse> {
    // TODO: Replace with actual API call
    // return this.http.put<IAgentResponse>(`${this.API_BASE}/${id}`, updates);

    const index = this.mockAgents.findIndex((a) => a.id === id);
    if (index !== -1) {
      this.mockAgents[index] = {
        ...this.mockAgents[index],
        ...updates,
        update_time: Date.now(),
        update_date: new Date().toISOString().split('T')[0],
      };

      return of({
        code: 0,
        data: this.mockAgents[index],
        message: 'Agent updated successfully',
      }).pipe(delay(300));
    }

    return throwError(() => new Error('Agent not found'));
  }

  /**
   * Delete an agent
   */
  deleteAgent(id: string): Observable<{ code: number; message: string }> {
    // TODO: Replace with actual API call
    // return this.http.delete<{ code: number; message: string }>(`${this.API_BASE}/${id}`);

    const index = this.mockAgents.findIndex((a) => a.id === id);
    if (index !== -1) {
      this.mockAgents.splice(index, 1);
      return of({
        code: 0,
        message: 'Agent deleted successfully',
      }).pipe(delay(300));
    }

    return throwError(() => new Error('Agent not found'));
  }

  /**
   * Rename an agent
   */
  renameAgent(id: string, newName: string): Observable<IAgentResponse> {
    return this.updateAgent(id, { title: newName });
  }
}
