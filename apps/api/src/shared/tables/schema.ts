import { account, accountRelations } from "./account.table";
import { assistant, assistantRelations } from "./assistant.table";
import { business, businessRelations } from "./business.table";
import {
    conversation,
    conversationRelations,
} from "./conversation.table";
import { knowledge, knowledgeRelations } from "./knowledge.table";
import { message, messageRelations } from "./message.table";
import { session, sessionRelations } from "./session.table";
import { user, userRelations } from "./user.table";
import { verification } from "./verification.table";
import {
    whatsappInstance,
    whatsappInstanceRelations,
} from "./whatsapp-instance.table";

export const schema = {
    user,
    account,
    session,
    verification,
    whatsappInstance,
    business,
    assistant,
    knowledge,
    conversation,
    message,
    accountRelations,
    sessionRelations,
    userRelations,
    whatsappInstanceRelations,
    businessRelations,
    assistantRelations,
    knowledgeRelations,
    conversationRelations,
    messageRelations,
}
