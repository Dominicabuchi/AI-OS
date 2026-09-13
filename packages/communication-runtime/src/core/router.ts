import {
  Message,
  SendResult
} from "../models/message";

import { Inbox } from "../models/inbox";

export interface CommunicationChannel {

  send(
    message: Message
  ): Promise<SendResult>;

  inbox(): Promise<Inbox>;

}
