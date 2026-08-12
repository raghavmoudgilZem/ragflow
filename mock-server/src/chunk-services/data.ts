export interface ChunkMetadata {
  page: number;
  section?: string;
  keywords?: string[];
  tags?: string[];
  content_type?: string;
}

export interface Chunk {
  id: string;
  document_id: string;
  content: string;
  metadata: ChunkMetadata;
  enabled: boolean;
  created_at: string;
  updated_at: string;
  thumbnail_url?: string | null;
}

export interface DocumentDetail {
  id: string;
  dataset_id: string;
  dataset_name: string;
  name: string;
  size_label: string;
  size_in_bytes: number;
  uploaded_at: string;
  chunk_count: number;
  preview_title: string;
  preview_subtitle: string;
}

export interface ParsedResult {
  document_id: string;
  content: string;
  layout_boxes: Array<{
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  markdown_blocks: Array<{
    id: string;
    content: string;
    type: string;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  status_code: number;
  errors: string[];
  data: T | null;
}

export const CONSTITUTION_DOC_ID = '73421ed07a9511f180c0ead4e2e6a82e';
export const CONSTITUTION_DATASET_ID = '63b15e587a9511f197efead4e2e6a82e';
export const TOTAL_CHUNKS = 538;

const FIRST_CHUNK_CONTENT = `[1 开, 2024 2aq4H叮] THE CONSTITUTION OF INDIA [As on 1st May, 2024] PREAMBLE WE, THE PEOPLE OF INDIA, having solemnly resolved to constitute India into a SOVEREIGN SOCIALIST SECULAR DEMOCRATIC REPUBLIC and to secure to all its citizens: JUSTICE, social, economic and political; LIBERTY of thought, expression, belief, faith and worship; EQUALITY of status and of opportunity; and to promote among them all FRATERNITY assuring the dignity of the individual and the unity and integrity of the Nation; IN OUR CONSTITUENT ASSEMBLY this twenty-sixth day of November, 1949, do HEREBY ADOPT, ENACT AND GIVE TO OURSELVES THIS CONSTITUTION.`;

function buildChunkContent(index: number): string {
  if (index === 0) return FIRST_CHUNK_CONTENT;
  const page = Math.floor(index / 3) + 1;
  return `Chunk ${index + 1} — Constitution of India (page ${page}). Article excerpt ${index + 1}: The State shall endeavour to secure a social order for the promotion of welfare of the people and shall strive to eliminate inequalities in status, facilities and opportunities.`;
}

function createChunks(): Chunk[] {
  const now = '2026-07-08T11:52:53.000Z';
  return Array.from({ length: TOTAL_CHUNKS }, (_, index) => ({
    id: `chunk-${CONSTITUTION_DOC_ID}-${index + 1}`,
    document_id: CONSTITUTION_DOC_ID,
    content: buildChunkContent(index),
    metadata: {
      page: Math.floor(index / 3) + 1,
      section: index === 0 ? 'Preamble' : `Part-${Math.floor(index / 20) + 1}`,
      content_type: 'Text',
      tags: ['constitution'],
    },
    enabled: true,
    created_at: now,
    updated_at: now,
    thumbnail_url: null,
  }));
}

export const documents: DocumentDetail[] = [
  {
    id: CONSTITUTION_DOC_ID,
    dataset_id: CONSTITUTION_DATASET_ID,
    dataset_name: 'Indian constitution',
    name: 'constitution.pdf',
    size_label: '2.3 MB',
    size_in_bytes: 2_411_520,
    uploaded_at: '08/07/2026 19:52:53',
    chunk_count: TOTAL_CHUNKS,
    preview_title: 'THE CONSTITUTION OF INDIA',
    preview_subtitle: '2024',
  },
];

export const chunks: Chunk[] = createChunks();

export const parsedResults: Record<string, ParsedResult> = {
  [CONSTITUTION_DOC_ID]: {
    document_id: CONSTITUTION_DOC_ID,
    content: FIRST_CHUNK_CONTENT,
    layout_boxes: [
      { page: 1, x: 80, y: 120, width: 420, height: 40 },
      { page: 1, x: 80, y: 180, width: 420, height: 220 },
    ],
    markdown_blocks: [
      {
        id: 'md-1',
        type: 'heading',
        content: 'THE CONSTITUTION OF INDIA',
      },
      {
        id: 'md-2',
        type: 'paragraph',
        content: FIRST_CHUNK_CONTENT,
      },
    ],
  },
};
