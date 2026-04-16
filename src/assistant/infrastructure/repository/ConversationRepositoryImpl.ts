import pg from "pg";
import type { ConversationRepository } from "../../domain/repository/ConversationRepository.js";
import type {
  Conversation,
  Message,
  ConversationWithLastMessage,
} from "../../domain/model/conversation.js";

export class ConversationRepositoryImpl implements ConversationRepository {
  private readonly pool: pg.Pool;

  constructor() {
    this.pool = new pg.Pool({
      connectionString: process.env["DATABASE_URL"],
      ssl: false,
    });
  }

  async create(userId: number, title?: string): Promise<Conversation> {
    const result = await this.pool.query(
      `INSERT INTO conversations (user_id, title)
       VALUES ($1, $2)
       RETURNING *`,
      [userId, title ?? "Nueva conversación"]
    );
    return this.mapConversation(result.rows[0]);
  }

  async createSeed(
    id: string,
    userId: number,
    title: string
  ): Promise<Conversation> {
    const result = await this.pool.query(
      `INSERT INTO conversations (id, user_id, title, is_seed, active)
       VALUES ($1, $2, $3, TRUE, TRUE)
       ON CONFLICT (id) DO UPDATE SET title = $3, user_id = $2, active = TRUE, updated_at = NOW()
       RETURNING *`,
      [id, userId, title]
    );
    return this.mapConversation(result.rows[0]);
  }

  async findByUserId(userId: number): Promise<ConversationWithLastMessage[]> {
    const result = await this.pool.query(
      `SELECT c.*,
              m.content AS last_message,
              COALESCE(mc.count, 0)::int AS message_count
       FROM conversations c
       LEFT JOIN LATERAL (
         SELECT content FROM messages
         WHERE conversation_id = c.id
         ORDER BY created_at DESC LIMIT 1
       ) m ON TRUE
       LEFT JOIN LATERAL (
         SELECT COUNT(*) AS count FROM messages
         WHERE conversation_id = c.id
       ) mc ON TRUE
       WHERE c.user_id = $1 AND c.active = TRUE
       ORDER BY c.is_seed DESC, c.updated_at DESC`,
      [userId]
    );
    return result.rows.map((row) => ({
      ...this.mapConversation(row),
      lastMessage: row.last_message ?? null,
      messageCount: row.message_count,
    }));
  }

  async findById(id: string): Promise<Conversation | null> {
    const result = await this.pool.query(
      `SELECT * FROM conversations WHERE id = $1 AND active = TRUE`,
      [id]
    );
    return result.rows[0] ? this.mapConversation(result.rows[0]) : null;
  }

  async updateTitle(id: string, title: string): Promise<void> {
    await this.pool.query(
      `UPDATE conversations SET title = $1, updated_at = NOW() WHERE id = $2`,
      [title, id]
    );
  }

  async deactivate(id: string): Promise<boolean> {
    const result = await this.pool.query(
      `UPDATE conversations SET active = FALSE, updated_at = NOW() WHERE id = $1 AND active = TRUE`,
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }

  async deactivateAllNonSeed(): Promise<number> {
    const result = await this.pool.query(
      `UPDATE conversations SET active = FALSE, updated_at = NOW() WHERE is_seed = FALSE AND active = TRUE`
    );
    return result.rowCount ?? 0;
  }

  async reactivateSeed(id: string): Promise<void> {
    await this.pool.query(
      `UPDATE conversations SET active = TRUE, updated_at = NOW() WHERE id = $1`,
      [id]
    );
  }

  async deleteMessagesBySeedConversation(conversationId: string): Promise<void> {
    await this.pool.query(
      `DELETE FROM messages WHERE conversation_id = $1`,
      [conversationId]
    );
  }

  // Messages 

  async addMessage(
    conversationId: string,
    role: "user" | "assistant",
    content: string
  ): Promise<Message> {
    const result = await this.pool.query(
      `INSERT INTO messages (conversation_id, role, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [conversationId, role, content]
    );

    await this.pool.query(
      `UPDATE conversations SET updated_at = NOW() WHERE id = $1`,
      [conversationId]
    );

    return this.mapMessage(result.rows[0]);
  }

  async getMessages(
    conversationId: string,
    limit = 50,
    offset = 0
  ): Promise<Message[]> {
    const result = await this.pool.query(
      `SELECT * FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC
       LIMIT $2 OFFSET $3`,
      [conversationId, limit, offset]
    );
    return result.rows.map(this.mapMessage);
  }

  async getMessageCount(conversationId: string): Promise<number> {
    const result = await this.pool.query(
      `SELECT COUNT(*)::int AS count FROM messages WHERE conversation_id = $1`,
      [conversationId]
    );
    return result.rows[0].count;
  }

  // Mappers 

  private mapConversation(row: Record<string, unknown>): Conversation {
    return {
      id: row.id as string,
      userId: Number(row.user_id),
      title: row.title as string,
      isSeed: row.is_seed as boolean,
      active: row.active as boolean,
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
    };
  }

  private mapMessage(row: Record<string, unknown>): Message {
    return {
      id: row.id as string,
      conversationId: row.conversation_id as string,
      role: row.role as "user" | "assistant",
      content: row.content as string,
      createdAt: new Date(row.created_at as string),
    };
  }
}