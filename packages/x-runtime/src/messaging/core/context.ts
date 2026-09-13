import { ConversationCache } from "./conversation-cache";
import { ParticipantRegistry } from "./participant-registry";
import { MessageStore } from "./message-store";

export class MessagingContext {

  readonly conversations =
    new ConversationCache();

  readonly participants =
    new ParticipantRegistry();

  readonly messages =
    new MessageStore();

}
