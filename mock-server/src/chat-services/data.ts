
export interface PromptConfig {
  empty_response: string;
  parameters: Parameter[];
  prologue: string;
  system: string;
  tts?: boolean;
  quote: boolean;
  keyword: boolean;
  refine_multiturn: boolean;
  use_kg: boolean;
  reasoning?: boolean;
  cross_languages?: Array<string>;
}

export interface Parameter {
  key: string;
  optional: boolean;
}

export interface Variable {
  frequency_penalty?: number;
  max_tokens?: number;
  presence_penalty?: number;
  temperature?: number;
  top_p?: number;
  llm_id?: string;
}

export interface IDialog {
  create_date: string;
  create_time: number;
  description: string;
  icon: string;
  id: string;
  dialog_id: string;
  kb_ids: string[];
  kb_names: string[];
  language: string;
  llm_id: string;
  llm_setting: Variable;
  llm_setting_type: string;
  name: string;
  prompt_config: PromptConfig;
  prompt_type: string;
  status: string;
  tenant_id: string;
  update_date: string;
  update_time: number;
  vector_similarity_weight: number;
  similarity_threshold: number;
  top_k: number;
  top_n: number;
}

export interface ApiResponse<T> {
  success: boolean;
  status_code: number;
  error?: string;
  data?: T;
}

export const dialogs: IDialog[] = [
  {
    create_date: '2024-06-24',
    create_time: Date.now() - 7 * 24 * 60 * 60 * 1000,
    description: 'Handles customer queries using the support KB',
    icon: '🤖',
    id: 'chat-001',
    dialog_id: 'dialog-001',
    kb_ids: ['kb-001'],
    kb_names: ['Support Knowledge Base'],
    language: 'en',
    llm_id: 'gpt-4',
    llm_setting: {
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 0.9,
    },
    llm_setting_type: 'Evenly',
    name: 'Customer Support Bot',
    prompt_config: {
      empty_response: 'I could not find an answer.',
      parameters: [{ key: 'query', optional: false }],
      prologue: 'You are a helpful support assistant.',
      system: 'Answer customer queries based on the knowledge base.',
      quote: true,
      keyword: true,
      refine_multiturn: true,
      use_kg: true,
    },
    prompt_type: 'rag',
    status: 'active',
    tenant_id: 'tenant-001',
    update_date: '2024-06-24',
    update_time: Date.now() - 1 * 24 * 60 * 60 * 1000,
    vector_similarity_weight: 0.5,
    similarity_threshold: 0.6,
    top_k: 10,
    top_n: 5,
  },
  {
    create_date: '2024-06-20',
    create_time: Date.now() - 5 * 24 * 60 * 60 * 1000,
    description: 'Answers HR policy questions for employees',
    icon: '👔',
    id: 'chat-002',
    dialog_id: 'dialog-002',
    kb_ids: ['kb-002'],
    kb_names: ['HR Policies'],
    language: 'en',
    llm_id: 'gpt-4',
    llm_setting: {
      temperature: 0.5,
      max_tokens: 1024,
      top_p: 0.8,
    },
    llm_setting_type: 'Precise',
    name: 'Internal HR Assistant',
    prompt_config: {
      empty_response: 'I do not have information about this HR topic.',
      parameters: [{ key: 'query', optional: false }],
      prologue: 'You are an HR policy assistant.',
      system: 'Answer HR-related questions based on company policies.',
      quote: true,
      keyword: true,
      refine_multiturn: false,
      use_kg: true,
    },
    prompt_type: 'rag',
    status: 'active',
    tenant_id: 'tenant-001',
    update_date: '2024-06-24',
    update_time: Date.now() - 2 * 24 * 60 * 60 * 1000,
    vector_similarity_weight: 0.6,
    similarity_threshold: 0.65,
    top_k: 8,
    top_n: 4,
  },
  {
    create_date: '2024-06-22',
    create_time: Date.now() - 3 * 24 * 60 * 60 * 1000,
    description: 'Public-facing product FAQ chatbot',
    icon: '❓',
    id: 'chat-003',
    dialog_id: 'dialog-003',
    kb_ids: ['kb-003', 'kb-004'],
    kb_names: ['Product FAQ', 'Features Guide'],
    language: 'en',
    llm_id: 'gpt-3.5-turbo',
    llm_setting: {
      temperature: 0.8,
      max_tokens: 1500,
      top_p: 0.95,
    },
    llm_setting_type: 'Creative',
    name: 'Product FAQ Chat',
    prompt_config: {
      empty_response: 'I do not have information about this feature.',
      parameters: [{ key: 'query', optional: false }],
      prologue: 'You are a friendly product assistant.',
      system: 'Help users with product questions in a friendly manner.',
      quote: true,
      keyword: false,
      refine_multiturn: true,
      use_kg: true,
      cross_languages: ['en', 'es', 'fr'],
    },
    prompt_type: 'rag',
    status: 'active',
    tenant_id: 'tenant-001',
    update_date: '2024-06-24',
    update_time: Date.now() - 1 * 60 * 60 * 1000,
    vector_similarity_weight: 0.4,
    similarity_threshold: 0.5,
    top_k: 12,
    top_n: 6,
  },
];

export type MessageType = 'user' | 'assistant';

export interface Message {
  content: string;
  role: MessageType;
  id?: string;
  doc_ids?: string[];
  prompt?: string;
}

export interface IReferenceChunk {
  id: string;
  content: null;
  document_id: string;
  document_name: string;
  dataset_id: string;
  image_id: string;
  similarity: number;
  vector_similarity: number;
  term_similarity: number;
  positions: number[];
  doc_type?: string;
}

export interface Docagg {
  count: number;
  doc_id: string;
  doc_name: string;
  url?: string;
}

export interface IReference {
  chunks: IReferenceChunk[];
  doc_aggs: Docagg[];
  total: number;
}

export interface IConversation {
  create_date: string;
  create_time: number;
  dialog_id: string;
  id: string;
  avatar: string;
  message: Message[];
  reference: IReference[];
  name: string;
  update_date: string;
  update_time: number;
  is_new: boolean;
}

 export const conversationData = [
    {
      id: 'conv-001',
      dialog_id: 'dialog-001',
      data: {
        id: 'conv-001',
        dialog_id: 'dialog-001',
        name: 'Refund policy question',
        avatar: '👤',
        create_date: '2024-06-20',
        create_time: Date.now() - 3 * 24 * 60 * 60 * 1000,
        update_date: '2024-06-24',
        update_time: Date.now() - 1 * 60 * 60 * 1000,
        is_new: false,
        message: [],
        reference: [],
      } as IConversation,
    },
    {
      id: 'conv-002',
      dialog_id: 'dialog-001',
      data: {
        id: 'conv-002',
        dialog_id: 'dialog-001',
        name: 'Shipping delay inquiry',
        avatar: '👤',
        create_date: '2024-06-18',
        create_time: Date.now() - 2 * 24 * 60 * 60 * 1000,
        update_date: '2024-06-22',
        update_time: Date.now() - 3 * 60 * 60 * 1000,
        is_new: false,
        message: [],
        reference: [],
      } as IConversation,
    },
    {
      id: 'conv-003',
      dialog_id: 'dialog-002',
      data: {
        id: 'conv-003',
        dialog_id: 'dialog-002',
        name: 'Leave policy clarification',
        avatar: '👤',
        create_date: '2024-06-15',
        create_time: Date.now() - 5 * 24 * 60 * 60 * 1000,
        update_date: '2024-06-24',
        update_time: Date.now() - 2 * 60 * 60 * 1000,
        is_new: false,
        message: [],
        reference: [],
      } as IConversation,
    },
  ];
