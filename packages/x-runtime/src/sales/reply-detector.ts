export class ReplyDetector {

  isReply(
    lastIncoming: string | undefined,
    lastOutgoing: string | undefined,
  ) {

    if (!lastIncoming) {
      return false;
    }

    if (!lastOutgoing) {
      return true;
    }

    return lastIncoming !== lastOutgoing;

  }

}
