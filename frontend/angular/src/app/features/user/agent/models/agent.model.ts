export enum AgentCategory {
  Agent = 'agent',
  DataflowCanvas = 'dataflow_canvas',
}

export enum TenantPermission {
  ME = 'me',
  TEAM = 'team',
}

export interface IAgent {
  id: string;
  title: string;
  description?: string;
  avatar?: string;
  create_date: string;
  create_time: number;
  update_date: string;
  update_time: number;
  user_id: string;
  nickname: string; // owner name
  canvas_type: string | null;
  canvas_category: AgentCategory | string;
  permission: TenantPermission | string;
  operator_permission?: number;
  dsl?: any;
}

export interface IAgentListResponse {
  code: number;
  data: IAgent[];
  message?: string;
}

export interface IAgentResponse {
  code: number;
  data: IAgent;
  message?: string;
}

export interface IAgentPaginationParams {
  page: number;
  page_size: number;
  orderby?: string;
  desc?: boolean;
  id?: string;
  title?: string;
}
