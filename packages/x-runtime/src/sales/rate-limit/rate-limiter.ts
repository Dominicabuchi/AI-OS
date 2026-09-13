export interface RateLimitConfig {

  perMinute: number;

  perHour: number;

  perDay: number;

}

export class RateLimiter {

  private readonly minute: number[] = [];
  private readonly hour: number[] = [];
  private readonly day: number[] = [];

  constructor(
    private readonly config: RateLimitConfig = {
      perMinute: 10,
      perHour: 150,
      perDay: 1000
    }
  ) {}

  private cleanup(now: number) {

    while (
      this.minute.length &&
      now - this.minute[0] > 60_000
    ) {
      this.minute.shift();
    }

    while (
      this.hour.length &&
      now - this.hour[0] > 3_600_000
    ) {
      this.hour.shift();
    }

    while (
      this.day.length &&
      now - this.day[0] > 86_400_000
    ) {
      this.day.shift();
    }

  }

  canSend(): boolean {

    const now = Date.now();

    this.cleanup(now);

    return (
      this.minute.length < this.config.perMinute &&
      this.hour.length < this.config.perHour &&
      this.day.length < this.config.perDay
    );

  }

  recordSend() {

    const now = Date.now();

    this.minute.push(now);
    this.hour.push(now);
    this.day.push(now);

  }

}
