import { XParticipant } from "./conversation";

export class ParticipantRegistry {

  private readonly byId =
    new Map<string, XParticipant>();

  private readonly byUsername =
    new Map<string, XParticipant>();

  register(participant: XParticipant) {

    this.byId.set(
      participant.id,
      participant
    );

    if (participant.username) {
      this.byUsername.set(
        participant.username.toLowerCase(),
        participant
      );
    }

  }

  getById(id: string) {
    return this.byId.get(id);
  }

  getByUsername(username: string) {
    return this.byUsername.get(
      username.toLowerCase()
    );
  }

  all() {
    return [...this.byId.values()];
  }

  clear() {
    this.byId.clear();
    this.byUsername.clear();
  }

}
