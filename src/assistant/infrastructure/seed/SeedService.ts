import { ConversationRepositoryImpl } from "../repository/ConversationRepositoryImpl.js";
import type { ConversationRepository } from "../../domain/repository/ConversationRepository.js";
import { SEED_CONVERSATIONS } from "./seed-conversations.js";

const DEMO_USER_ID = Number(process.env["DEMO_USER_ID"] ?? "4");

const repo: ConversationRepository = new ConversationRepositoryImpl();

// Resets all conversations:

export async function resetConversations(): Promise<void> {
  const deactivatedCount = await repo.deactivateAllNonSeed();
  console.log(`[seed] Deactivated ${deactivatedCount} non-seed conversations`);

  for (const seed of SEED_CONVERSATIONS) {
    await repo.createSeed(seed.id, DEMO_USER_ID, seed.title);
    await repo.reactivateSeed(seed.id);

    await repo.deleteMessagesBySeedConversation(seed.id);
    for (const msg of seed.messages) {
      await repo.addMessage(seed.id, msg.role, msg.content);
    }

    console.log(
      `[seed] Reset seed conversation: "${seed.title}" (${seed.messages.length} messages)`
    );
  }

  console.log("[seed] Conversation reset complete");
}

// Starts the daily cron job. Runs every day at 5:00 AM Colombia (10:00 UTC).

export function startSeedJob(): void {
  const RESET_HOUR_UTC = 10; 
  const RESET_MINUTE = 0;

  function scheduleNext(): void {
    const now = new Date();
    const target = new Date();
    target.setUTCHours(RESET_HOUR_UTC, RESET_MINUTE, 0, 0);

    if (target.getTime() <= now.getTime()) {
      target.setDate(target.getDate() + 1);
    }

    const delay = target.getTime() - now.getTime();
    const hours = Math.floor(delay / 3_600_000);
    const mins = Math.floor((delay % 3_600_000) / 60_000);
    console.log(`[seed] Next reset in ${hours}h ${mins}m (at 5:00 AM COT)`);

    setTimeout(() => {
      resetConversations()
        .catch((err) => console.error("[seed] Error during reset:", err))
        .finally(() => scheduleNext());
    }, delay);
  }

  scheduleNext();
  console.log("[seed] Daily conversation reset job started (5:00 AM COT)");
}