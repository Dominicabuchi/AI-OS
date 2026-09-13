import { Message, SendResult } from "../models/message";
import { CommunicationChannel } from "./router";

export class CommunicationManager {
  private readonly channels = new Map<string, CommunicationChannel>();

  register(
    name: string,
    channel: CommunicationChannel
  ): void {
    this.channels.set(name, channel);
  }

  async send(message: Message): Promise<SendResult> {
    const channel = this.channels.get(message.channel);

    if (!channel) {
      throw new Error(
        `Channel not registered: ${message.channel}`
      );
    }

    return channel.send(message);
  }
}
