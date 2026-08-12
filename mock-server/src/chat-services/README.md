# Chat Services Mock API Specification

## Overview
Mock HTTP server for Chat services with dialog management and conversations. Runs at `http://localhost:4000`

**Runtime:** Node.js + Express.js  
**Port:** 4000  
**Status Check:** `GET http://localhost:4000/health`

---

## Data Models

### PromptConfig
Configuration for LLM prompts and responses.

```typescript
interface PromptConfig {
  empty_response: string;              // Response when no answer found
  parameters: Parameter[];             // Required parameters
  prologue: string;                    // System prompt preamble
  system: string;                      // System instructions
  tts?: boolean;                       // Text-to-speech enabled
  quote: boolean;                      // Include quotes in response
  keyword: boolean;                    // Extract keywords
  refine_multiturn: boolean;           // Refine multi-turn conversations
  use_kg: boolean;                     // Use knowledge graph
  reasoning?: boolean;                 // Enable reasoning
  cross_languages?: Array<string>;     // Supported languages
}
```

### Parameter
Parameter definition for prompts.

```typescript
interface Parameter {
  key: string;         // Parameter name
  optional: boolean;   // Whether parameter is optional
}
```

### Variable (LLM Settings)
LLM configuration variables.

```typescript
interface Variable {
  frequency_penalty?: number;   // Frequency penalty (0-2)
  max_tokens?: number;          // Maximum tokens to generate
  presence_penalty?: number;    // Presence penalty (0-2)
  temperature?: number;         // Temperature (0-2)
  top_p?: number;              // Top-p sampling
  llm_id?: string;             // LLM model identifier
}
```

### Dialog (Chat)
Represents a chat application / dialog session.

```typescript
interface IDialog {
  create_date: string;                   // Creation date (YYYY-MM-DD)
  create_time: number;                   // Unix timestamp (ms)
  description: string;                   // Purpose of the dialog
  icon: string;                          // Emoji or icon
  id: string;                            // Unique identifier (chat-XXX)
  dialog_id: string;                     // Dialog identifier
  kb_ids: string[];                      // Linked knowledge base IDs
  kb_names: string[];                    // Knowledge base names
  language: string;                      // Language code (e.g., 'en')
  llm_id: string;                        // LLM model identifier
  llm_setting: Variable;                 // LLM configuration
  llm_setting_type: string;              // Setting type (e.g., 'Evenly', 'Precise', 'Creative')
  name: string;                          // Dialog name
  prompt_config: PromptConfig;           // Prompt configuration
  prompt_type: string;                   // Type of prompt (e.g., 'rag')
  status: string;                        // Status (e.g., 'active')
  tenant_id: string;                     // Tenant identifier
  update_date: string;                   // Last update date (YYYY-MM-DD)
  update_time: number;                   // Last update timestamp (ms)
  vector_similarity_weight: number;      // Weight for vector similarity
  similarity_threshold: number;          // Threshold for similarity
  top_k: number;                         // Top-k results for retrieval
  top_n: number;                         // Top-n results limit
}
```

**Example:**
```json
{
  "create_date": "2024-06-24",
  "create_time": 1719187200000,
  "description": "Handles customer queries using the support KB",
  "icon": "🤖",
  "id": "chat-001",
  "dialog_id": "dialog-001",
  "kb_ids": ["kb-001"],
  "kb_names": ["Support Knowledge Base"],
  "language": "en",
  "llm_id": "gpt-4",
  "llm_setting": {
    "temperature": 0.7,
    "max_tokens": 2048,
    "top_p": 0.9
  },
  "llm_setting_type": "Evenly",
  "name": "Customer Support Bot",
  "prompt_config": {
    "empty_response": "I could not find an answer.",
    "parameters": [{ "key": "query", "optional": false }],
    "prologue": "You are a helpful support assistant.",
    "system": "Answer customer queries based on the knowledge base.",
    "quote": true,
    "keyword": true,
    "refine_multiturn": true,
    "use_kg": true
  },
  "prompt_type": "rag",
  "status": "active",
  "tenant_id": "tenant-001",
  "update_date": "2024-06-24",
  "update_time": 1719273600000,
  "vector_similarity_weight": 0.5,
  "similarity_threshold": 0.6,
  "top_k": 10,
  "top_n": 5
}
```

### Message
Represents a message in a conversation.

```typescript
interface Message {
  content: string;           // Message content
  role: MessageType;         // 'user' | 'assistant'
  id?: string;              // Message identifier
  doc_ids?: string[];       // Referenced document IDs
  prompt?: string;          // Prompt used to generate response
}
```

### IReferenceChunk
A reference chunk from a document.

```typescript
interface IReferenceChunk {
  id: string;                    // Chunk identifier
  content: null;                 // Content (null in this version)
  document_id: string;           // Source document ID
  document_name: string;         // Document name
  dataset_id: string;            // Dataset identifier
  image_id: string;              // Image identifier
  similarity: number;            // Similarity score
  vector_similarity: number;     // Vector similarity score
  term_similarity: number;       // Term similarity score
  positions: number[];           // Positions in document
  doc_type?: string;             // Document type
}
```

### Docagg
Document aggregation summary.

```typescript
interface Docagg {
  count: number;          // Count of references
  doc_id: string;         // Document ID
  doc_name: string;       // Document name
  url?: string;           // Document URL
}
```

### IReference
Reference information for a response.

```typescript
interface IReference {
  chunks: IReferenceChunk[];     // Reference chunks
  doc_aggs: Docagg[];            // Document aggregations
  total: number;                 // Total references
}
```

### Conversation
Represents a conversation session within a dialog.

```typescript
interface IConversation {
  create_date: string;           // Creation date (YYYY-MM-DD)
  create_time: number;           // Unix timestamp (ms)
  dialog_id: string;             // Parent dialog ID
  id: string;                    // Unique conversation identifier
  avatar: string;                // Avatar emoji
  message: Message[];            // Messages in conversation
  reference: IReference[];        // References for conversation
  name: string;                  // Conversation title
  update_date: string;           // Last update date (YYYY-MM-DD)
  update_time: number;           // Last update timestamp (ms)
  is_new: boolean;               // Whether conversation is new
}
```

**Example:**
```json
{
  "create_date": "2024-06-20",
  "create_time": 1719100800000,
  "dialog_id": "dialog-001",
  "id": "conv-001",
  "avatar": "👤",
  "name": "Refund policy question",
  "message": [
    {
      "id": "msg-001",
      "role": "user",
      "content": "What is your refund policy?"
    },
    {
      "id": "msg-002",
      "role": "assistant",
      "content": "Our refund policy allows returns within 30 days of purchase for full refund.",
      "doc_ids": ["doc-001", "doc-002"],
      "prompt": "Answer based on the support knowledge base"
    }
  ],
  "reference": [],
  "update_date": "2024-06-24",
  "update_time": 1719273600000,
  "is_new": false
}
```

### ApiResponse
Standard API response envelope.

```typescript
interface ApiResponse<T> {
  success: boolean;        // Request success status
  status_code: number;     // HTTP status code
  error?: string;          // Error message (if failed)
  data?: T;               // Response data (if successful)
}
```

---

## API Endpoints

### Dialogs (Chats)

#### 1. List Dialogs
**Endpoint:** `POST /api/chats/dialog/list`

**Purpose:** Fetch paginated list of dialogs with optional keyword search.

**Request Body:**
```json
{
  "page": 1,
  "page_size": 10,
  "keywords": ""
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| page | number | No | 1 | Page number (1-based) |
| page_size | number | No | 10 | Results per page |
| keywords | string | No | "" | Search filter by dialog name |

**Response:**
```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "dialogs": [
      {
        "create_date": "2024-06-24",
        "create_time": 1719187200000,
        "description": "Handles customer queries using the support KB",
        "icon": "🤖",
        "id": "chat-001",
        "dialog_id": "dialog-001",
        "kb_ids": ["kb-001"],
        "kb_names": ["Support Knowledge Base"],
        "language": "en",
        "llm_id": "gpt-4",
        "llm_setting": {
          "temperature": 0.7,
          "max_tokens": 2048,
          "top_p": 0.9
        },
        "llm_setting_type": "Evenly",
        "name": "Customer Support Bot",
        "prompt_config": {
          "empty_response": "I could not find an answer.",
          "parameters": [{ "key": "query", "optional": false }],
          "prologue": "You are a helpful support assistant.",
          "system": "Answer customer queries based on the knowledge base.",
          "quote": true,
          "keyword": true,
          "refine_multiturn": true,
          "use_kg": true
        },
        "prompt_type": "rag",
        "status": "active",
        "tenant_id": "tenant-001",
        "update_date": "2024-06-24",
        "update_time": 1719273600000,
        "vector_similarity_weight": 0.5,
        "similarity_threshold": 0.6,
        "top_k": 10,
        "top_n": 5
      }
    ],
    "total": 3
  }
}
```

**Status Codes:**
- `200 OK` — Success
- `400 Bad Request` — Invalid pagination parameters

**Test:**
```bash
curl -X POST http://localhost:4000/api/chats/dialog/list \
  -H "Content-Type: application/json" \
  -d '{"page":1,"page_size":10,"keywords":""}'
```

---

#### 2. Get Dialog by ID
**Endpoint:** `GET /api/chats/dialog/:chat_id`

**Purpose:** Retrieve a single dialog by its ID.

**URL Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| chat_id | string | Yes | Dialog ID (e.g., chat-001) |

**Response:**
```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "create_date": "2024-06-24",
    "create_time": 1719187200000,
    "description": "Handles customer queries using the support KB",
    "icon": "🤖",
    "id": "chat-001",
    "dialog_id": "dialog-001",
    "kb_ids": ["kb-001"],
    "kb_names": ["Support Knowledge Base"],
    "language": "en",
    "llm_id": "gpt-4",
    "llm_setting": {
      "temperature": 0.7,
      "max_tokens": 2048,
      "top_p": 0.9
    },
    "llm_setting_type": "Evenly",
    "name": "Customer Support Bot",
    "prompt_config": {
      "empty_response": "I could not find an answer.",
      "parameters": [{ "key": "query", "optional": false }],
      "prologue": "You are a helpful support assistant.",
      "system": "Answer customer queries based on the knowledge base.",
      "quote": true,
      "keyword": true,
      "refine_multiturn": true,
      "use_kg": true
    },
    "prompt_type": "rag",
    "status": "active",
    "tenant_id": "tenant-001",
    "update_date": "2024-06-24",
    "update_time": 1719273600000,
    "vector_similarity_weight": 0.5,
    "similarity_threshold": 0.6,
    "top_k": 10,
    "top_n": 5
  }
}
```

**Status Codes:**
- `200 OK` — Success
- `400 Bad Request` — Dialog not found

**Test:**
```bash
curl http://localhost:4000/api/chats/dialog/chat-001
```

---

#### 3. Create Dialog
**Endpoint:** `POST /api/chats/dialog`

**Purpose:** Create a new dialog.

**Request Body:**
```json
{
  "name": "New Support Bot",
  "description": "Optional description",
  "kb_ids": [],
  "kb_names": [],
  "language": "en",
  "llm_id": "gpt-4"
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| name | string | Yes | - | Dialog name (min 1 character) |
| description | string | No | "" | Dialog description |
| kb_ids | string[] | No | [] | Knowledge base IDs |
| kb_names | string[] | No | [] | Knowledge base names |
| language | string | No | "en" | Language code |
| llm_id | string | No | "gpt-4" | LLM model ID |

**Response:**
```json
{
  "success": true,
  "status_code": 201,
  "data": {
    "create_date": "2024-06-24",
    "create_time": 1719360000000,
    "description": "Optional description",
    "icon": "🤖",
    "id": "chat-1719360000000",
    "dialog_id": "dialog-1719360000000",
    "kb_ids": [],
    "kb_names": [],
    "language": "en",
    "llm_id": "gpt-4",
    "llm_setting": {
      "temperature": 0.7,
      "max_tokens": 2048,
      "top_p": 0.9
    },
    "llm_setting_type": "Evenly",
    "name": "New Support Bot",
    "prompt_config": {
      "empty_response": "I could not find an answer.",
      "parameters": [{ "key": "query", "optional": false }],
      "prologue": "You are a helpful assistant.",
      "system": "Answer queries based on the knowledge base.",
      "quote": true,
      "keyword": true,
      "refine_multiturn": true,
      "use_kg": true
    },
    "prompt_type": "rag",
    "status": "active",
    "tenant_id": "tenant-001",
    "update_date": "2024-06-24",
    "update_time": 1719360000000,
    "vector_similarity_weight": 0.5,
    "similarity_threshold": 0.6,
    "top_k": 10,
    "top_n": 5
  }
}
```

**Status Codes:**
- `201 Created` — Dialog created successfully
- `400 Bad Request` — Missing or invalid name

**Test:**
```bash
curl -X POST http://localhost:4000/api/chats/dialog \
  -H "Content-Type: application/json" \
  -d '{"name":"New Support Bot"}'
```

---

#### 4. Update Dialog
**Endpoint:** `PUT /api/chats/dialog/:chat_id`

**Purpose:** Update an existing dialog.

**URL Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| chat_id | string | Yes | Dialog ID |

**Request Body:**
```json
{
  "name": "Updated Dialog Name",
  "description": "Updated description",
  "llm_setting": {
    "temperature": 0.5,
    "max_tokens": 1024
  },
  "prompt_config": {
    "empty_response": "No answer found.",
    "quote": false
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | No | Updated dialog name |
| description | string | No | Updated description |
| llm_setting | Variable | No | Updated LLM settings (merged) |
| prompt_config | PromptConfig | No | Updated prompt config (merged) |

**Response:**
```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "create_date": "2024-06-24",
    "create_time": 1719187200000,
    "description": "Updated description",
    "icon": "🤖",
    "id": "chat-001",
    "dialog_id": "dialog-001",
    "kb_ids": ["kb-001"],
    "kb_names": ["Support Knowledge Base"],
    "language": "en",
    "llm_id": "gpt-4",
    "llm_setting": {
      "temperature": 0.5,
      "max_tokens": 1024,
      "top_p": 0.9
    },
    "llm_setting_type": "Evenly",
    "name": "Updated Dialog Name",
    "prompt_config": {
      "empty_response": "No answer found.",
      "parameters": [{ "key": "query", "optional": false }],
      "prologue": "You are a helpful support assistant.",
      "system": "Answer customer queries based on the knowledge base.",
      "quote": false,
      "keyword": true,
      "refine_multiturn": true,
      "use_kg": true
    },
    "prompt_type": "rag",
    "status": "active",
    "tenant_id": "tenant-001",
    "update_date": "2024-06-24",
    "update_time": 1719360000000,
    "vector_similarity_weight": 0.5,
    "similarity_threshold": 0.6,
    "top_k": 10,
    "top_n": 5
  }
}
```

**Status Codes:**
- `200 OK` — Dialog updated
- `400 Bad Request` — Dialog not found

**Test:**
```bash
curl -X PUT http://localhost:4000/api/chats/dialog/chat-001 \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Dialog Name"}'
```

---

#### 5. Delete Dialog
**Endpoint:** `DELETE /api/chats/dialog/:chat_id`

**Purpose:** Delete a single dialog.

**URL Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| chat_id | string | Yes | Dialog ID |

**Response:**
```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "id": "chat-001"
  }
}
```

**Status Codes:**
- `200 OK` — Dialog deleted
- `400 Bad Request` — Dialog not found

**Test:**
```bash
curl -X DELETE http://localhost:4000/api/chats/dialog/chat-001
```

---

#### 6. Batch Delete Dialogs
**Endpoint:** `POST /api/chats/dialog/batch/delete`

**Purpose:** Delete multiple dialogs in one request.

**Request Body:**
```json
{
  "ids": ["chat-001", "chat-002"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| ids | string[] | Yes | Array of dialog IDs to delete |

**Response:**
```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "deleted": ["chat-001", "chat-002"]
  }
}
```

**Status Codes:**
- `200 OK` — Dialogs deleted (even if some IDs didn't exist)
- `400 Bad Request` — Invalid or empty ids array

**Test:**
```bash
curl -X POST http://localhost:4000/api/chats/dialog/batch/delete \
  -H "Content-Type: application/json" \
  -d '{"ids":["chat-001","chat-002"]}'
```

---

### Conversations

#### 7. List Conversations
**Endpoint:** `GET /api/chats/conversation/list`

**Purpose:** Fetch conversations for a specific dialog with optional keyword search.

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| dialog_id | string | Yes | Parent dialog ID |
| keywords | string | No | Search filter by conversation name |

**Response:**
```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "conversations": [
      {
        "create_date": "2024-06-20",
        "create_time": 1719100800000,
        "dialog_id": "dialog-001",
        "id": "conv-001",
        "avatar": "👤",
        "name": "Refund policy question",
        "message": [
          {
            "id": "msg-001",
            "role": "user",
            "content": "What is your refund policy?"
          },
          {
            "id": "msg-002",
            "role": "assistant",
            "content": "Our refund policy allows returns within 30 days of purchase for full refund.",
            "doc_ids": ["doc-001", "doc-002"],
            "prompt": "Answer based on the support knowledge base"
          }
        ],
        "reference": [],
        "update_date": "2024-06-24",
        "update_time": 1719273600000,
        "is_new": false
      }
    ],
    "total": 2
  }
}
```

**Status Codes:**
- `200 OK` — Success (empty array if dialog has no conversations)
- `400 Bad Request` — Missing dialog_id

**Test:**
```bash
curl "http://localhost:4000/api/chats/conversation/list?dialog_id=dialog-001&keywords="
```

---

#### 8. Get Conversation by ID
**Endpoint:** `GET /api/chats/conversation/:id`

**Purpose:** Retrieve a single conversation by its ID.

**URL Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Conversation ID |

**Response:**
```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "create_date": "2024-06-20",
    "create_time": 1719100800000,
    "dialog_id": "dialog-001",
    "id": "conv-001",
    "avatar": "👤",
    "name": "Refund policy question",
    "message": [
      {
        "id": "msg-001",
        "role": "user",
        "content": "What is your refund policy?"
      },
      {
        "id": "msg-002",
        "role": "assistant",
        "content": "Our refund policy allows returns within 30 days of purchase for full refund.",
        "doc_ids": ["doc-001", "doc-002"],
        "prompt": "Answer based on the support knowledge base"
      }
    ],
    "reference": [],
    "update_date": "2024-06-24",
    "update_time": 1719273600000,
    "is_new": false
  }
}
```

**Status Codes:**
- `200 OK` — Success
- `400 Bad Request` — Conversation not found

**Test:**
```bash
curl http://localhost:4000/api/chats/conversation/conv-001
```

---

#### 9. Create Conversation
**Endpoint:** `POST /api/chats/conversation`

**Purpose:** Create a new conversation within a dialog.

**Request Body:**
```json
{
  "dialog_id": "dialog-001",
  "name": "New conversation about refunds"
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| dialog_id | string | Yes | - | Parent dialog ID |
| name | string | No | "New Conversation" | Conversation name |

**Response:**
```json
{
  "success": true,
  "status_code": 201,
  "data": {
    "create_date": "2024-06-24",
    "create_time": 1719360000000,
    "dialog_id": "dialog-001",
    "id": "conv-1719360000000",
    "avatar": "👤",
    "name": "New conversation about refunds",
    "message": [],
    "reference": [],
    "update_date": "2024-06-24",
    "update_time": 1719360000000,
    "is_new": true
  }
}
```

**Status Codes:**
- `201 Created` — Conversation created
- `400 Bad Request` — Missing dialog_id

**Test:**
```bash
curl -X POST http://localhost:4000/api/chats/conversation \
  -H "Content-Type: application/json" \
  -d '{"dialog_id":"dialog-001","name":"New conversation about refunds"}'
```

---

#### 10. Add Message to Conversation
**Endpoint:** `POST /api/chats/conversation/:id/message`

**Purpose:** Add a message to an existing conversation.

**URL Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Conversation ID |

**Request Body:**
```json
{
  "content": "What is your return policy?",
  "role": "user",
  "doc_ids": [],
  "prompt": ""
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| content | string | Yes | - | Message content |
| role | string | Yes | - | "user" or "assistant" |
| doc_ids | string[] | No | [] | Referenced document IDs |
| prompt | string | No | "" | Prompt used to generate message |

**Response:**
```json
{
  "success": true,
  "status_code": 201,
  "data": {
    "id": "msg-1719360000000",
    "role": "user",
    "content": "What is your return policy?"
  }
}
```

**Status Codes:**
- `201 Created` — Message added
- `400 Bad Request` — Missing required fields or conversation not found

**Test:**
```bash
curl -X POST http://localhost:4000/api/chats/conversation/conv-001/message \
  -H "Content-Type: application/json" \
  -d '{"content":"What is your return policy?","role":"user"}'
```

---

#### 11. Delete Conversation
**Endpoint:** `DELETE /api/chats/conversation/:id`

**Purpose:** Delete a conversation.

**URL Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Conversation ID |

**Response:**
```json
{
  "success": true,
  "status_code": 200,
  "data": {
    "id": "conv-001"
  }
}
```

**Status Codes:**
- `200 OK` — Conversation deleted
- `400 Bad Request` — Conversation not found

**Test:**
```bash
curl -X DELETE http://localhost:4000/api/chats/conversation/conv-001
```

---

## Standard Response Format

All API responses follow this format:

```json
{
  "success": boolean,
  "status_code": number,
  "error": "error message (if applicable)",
  "data": {}
}
```

| Field | Type | Description |
|-------|------|-------------|
| success | boolean | `true` for successful requests, `false` for errors |
| status_code | number | HTTP status code (200, 201, 400, etc.) |
| error | string | Error message (only present if success is false) |
| data | object \| null | Response payload (null on error) |

---

## Error Responses

**404 Not Found:**
```json
{
  "success": false,
  "status_code": 400,
  "error": "Dialog not found",
  "data": null
}
```

**400 Bad Request:**
```json
{
  "success": false,
  "status_code": 400,
  "error": "Invalid pagination parameters",
  "data": null
}
```

**Missing Required Field:**
```json
{
  "success": false,
  "status_code": 400,
  "error": "dialog_id is required",
  "data": null
}
```

---

## Mock Data Seed

The server starts with these Dialogs:

| ID | Name | Description | LLM | Type |
|----|----|---|---|---|
| chat-001 | Customer Support Bot | Handles customer queries using the support KB | gpt-4 | rag |
| chat-002 | Internal HR Assistant | Answers HR policy questions for employees | gpt-4 | rag |
| chat-003 | Product FAQ Chat | Public-facing product FAQ chatbot | gpt-3.5-turbo | rag |

### Sample Conversations

**dialog-001** has 2 conversations:
- conv-001: "Refund policy question"
- conv-002: "Shipping delay inquiry"

**dialog-002** has 1 conversation:
- conv-003: "Leave policy clarification"

**dialog-003** has no conversations yet.

---

## Adding New Mock Data

**For new Dialogs:** Edit `src/data.ts`:
```typescript
const dialogs: IDialog[] = [
  // ... existing dialogs
  {
    create_date: new Date().toISOString().split('T')[0],
    create_time: Date.now(),
    description: 'New dialog description',
    icon: '🎯',
    id: 'chat-004',
    dialog_id: 'dialog-004',
    kb_ids: ['kb-004'],
    kb_names: ['New KB'],
    language: 'en',
    llm_id: 'gpt-4',
    llm_setting: {
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 0.9,
    },
    llm_setting_type: 'Evenly',
    name: 'New Dialog',
    prompt_config: {
      empty_response: 'I could not find an answer.',
      parameters: [{ key: 'query', optional: false }],
      prologue: 'You are a helpful assistant.',
      system: 'Answer questions based on knowledge base.',
      quote: true,
      keyword: true,
      refine_multiturn: true,
      use_kg: true,
    },
    prompt_type: 'rag',
    status: 'active',
    tenant_id: 'tenant-001',
    update_date: new Date().toISOString().split('T')[0],
    update_time: Date.now(),
    vector_similarity_weight: 0.5,
    similarity_threshold: 0.6,
    top_k: 10,
    top_n: 5,
  },
];
```

**For new Conversations:** Edit `src/data.ts`:
```typescript
const conversations: Record<string, IConversation[]> = {
  // ... existing conversations
  'dialog-004': [
    {
      create_date: new Date().toISOString().split('T')[0],
      create_time: Date.now(),
      dialog_id: 'dialog-004',
      id: 'conv-004',
      avatar: '👤',
      name: 'First conversation',
      message: [],
      reference: [],
      update_date: new Date().toISOString().split('T')[0],
      update_time: Date.now(),
      is_new: true,
    },
  ],
};
```

Then restart the server: `npm run dev`

---

## Running the Server

```bash
cd rag/mock-server
npm install
npm run dev
```

Server starts at `http://localhost:4000`

Check health:
```bash
curl http://localhost:4000/health
```

---

## Used By

- ✅ React Frontend (`rag/frontend/react`)
- ✅ Angular Frontend (`rag/frontend/angular`)
- ✅ Node Backend
- ✅ .NET Backend
- ✅ Java Backend
