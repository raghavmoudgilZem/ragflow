import { db } from '../db.js';
import { IDialog, IConversation, Message, dialogs, conversationData } from './data.js';

class ChatRepository {
  // Table Creation & Seeding
  createTables(): void {
    db.exec(`
      CREATE TABLE IF NOT EXISTS dialogs (
        id         TEXT PRIMARY KEY,
        dialog_id  TEXT UNIQUE NOT NULL,
        data       TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS conversations (
        id         TEXT PRIMARY KEY,
        dialog_id  TEXT NOT NULL,
        data       TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS messages (
        id               TEXT PRIMARY KEY,
        conversation_id  TEXT NOT NULL,
        data             TEXT NOT NULL
      );
    `);
  }

  seedData(): void {
    const { count } = db
      .prepare('SELECT COUNT(*) as count FROM dialogs')
      .get() as { count: number };

    if (count > 0) return;

    const insertDialog = db.prepare(
      'INSERT INTO dialogs (id, dialog_id, data) VALUES (?, ?, ?)'
    );

    dialogs.forEach((dialog) => {
      insertDialog.run(dialog.id, dialog.dialog_id, JSON.stringify(dialog));
    });

    this.seedConversations();
  }

  // Dialog Methods
  getDialogs(): IDialog[] {
    const rows = db
      .prepare(
        "SELECT data FROM dialogs ORDER BY json_extract(data, '$.create_time') DESC"
      )
      .all() as { data: string }[];

    return rows.map((row) => JSON.parse(row.data));
  }

  getDialogById(id: string): IDialog | null {
    const row = db
      .prepare('SELECT data FROM dialogs WHERE id = ?')
      .get(id) as { data: string } | undefined;

    return row ? JSON.parse(row.data) : null;
  }

  createDialog(dialog: IDialog): IDialog {
    db.prepare(
      'INSERT INTO dialogs (id, dialog_id, data) VALUES (?, ?, ?)'
    ).run(dialog.id, dialog.dialog_id, JSON.stringify(dialog));

    return dialog;
  }

  updateDialog(
    id: string,
    updates: Partial<IDialog>
  ): IDialog | null {
    const current = this.getDialogById(id);
    if (!current) return null;

    const updated = { ...current, ...updates };
    db.prepare('UPDATE dialogs SET data = ? WHERE id = ?').run(
      JSON.stringify(updated),
      id
    );

    return updated;
  }

  deleteDialog(id: string): boolean {
    const result = db.prepare('DELETE FROM dialogs WHERE id = ?').run(id);
    return result.changes > 0;
  }

  deleteDialogs(ids: string[]): string[] {
    const stmt = db.prepare('DELETE FROM dialogs WHERE id = ?');
    return ids.filter((id) => stmt.run(id).changes > 0);
  }

  // Conversation Methods
  getConversations(dialogId: string): IConversation[] {
    const rows = db
      .prepare(
        "SELECT data FROM conversations WHERE dialog_id = ? ORDER BY json_extract(data, '$.update_time') DESC"
      )
      .all(dialogId) as { data: string }[];

    return rows.map((row) => JSON.parse(row.data));
  }

  getConversationById(id: string): IConversation | null {
    const row = db
      .prepare('SELECT data FROM conversations WHERE id = ?')
      .get(id) as { data: string } | undefined;

    return row ? JSON.parse(row.data) : null;
  }

  createConversation(
    conversation: IConversation
  ): IConversation {
    db.prepare(
      'INSERT INTO conversations (id, dialog_id, data) VALUES (?, ?, ?)'
    ).run(conversation.id, conversation.dialog_id, JSON.stringify(conversation));

    return conversation;
  }

  updateConversation(
    id: string,
    updates: Partial<IConversation>
  ): IConversation | null {
    const current = this.getConversationById(id);
    if (!current) return null;

    const updated = { ...current, ...updates };
    db.prepare('UPDATE conversations SET data = ? WHERE id = ?').run(
      JSON.stringify(updated),
      id
    );

    return updated;
  }

  deleteConversation(id: string): boolean {
    db.prepare('DELETE FROM messages WHERE conversation_id = ?').run(id);
    const result = db.prepare('DELETE FROM conversations WHERE id = ?').run(id);
    return result.changes > 0;
  }

  // Message Methods
  addMessageToConversation(
    conversationId: string,
    message: Message
  ): Message {
    db.prepare(
      'INSERT INTO messages (id, conversation_id, data) VALUES (?, ?, ?)'
    ).run(message.id, conversationId, JSON.stringify(message));

    return message;
  }

  // Private helper method
  private seedConversations(): void {
    const { count } = db
      .prepare('SELECT COUNT(*) as count FROM conversations')
      .get() as { count: number };

    if (count > 0) return;

    const insertConv = db.prepare(
      'INSERT INTO conversations (id, dialog_id, data) VALUES (?, ?, ?)'
    );

    conversationData.forEach((conv) => {
      insertConv.run(conv.id, conv.dialog_id, JSON.stringify(conv.data));
    });
  }
}

export const chatRepository = new ChatRepository();