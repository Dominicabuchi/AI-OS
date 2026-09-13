import { Tool } from "../types/tool";
import { BrowserManager } from "@ai-os/browser-runtime";
import { LinkedInRuntime } from "@ai-os/linkedin-runtime";
import { GmailTool } from "./gmail-tool";

export class LinkedInTool implements Tool {

  readonly id = "linkedin";

  readonly name = "LinkedIn";

  readonly description =
    "LinkedIn messaging, search, profiles, jobs, network and communication.";

  private browser = BrowserManager.shared();
  private runtime?: LinkedInRuntime;

  private gmail =
    new GmailTool();

  canExecute(action: string): boolean {
    return action.startsWith("linkedin.");
  }

  private async getRuntime(): Promise<LinkedInRuntime> {
    await this.browser.usePlatform(
      "linkedin"
    );

    this.runtime =
      new LinkedInRuntime(
        this.browser.getHumanBrowser()
      );

    return this.runtime;
  }

  async execute(
    action: string,
    payload: Record<string, unknown>
  ): Promise<unknown> {

    const runtime = await this.getRuntime();

    switch (action) {

      case "linkedin.message":
      case "linkedin.send": {
        const recipient =
          String(
            payload.recipient ??
            payload.name ??
            ""
          ).trim();

        if (!recipient) {
          throw new Error(
            "linkedin.send requires payload.recipient"
          );
        }

        const messageText =
          String(
            payload.text ??
            payload.message ??
            ""
          );

        const company =
          payload.company
            ? String(payload.company)
            : undefined;

        const result =
          await runtime.messaging.sendTargeted({
            recipient,
            company,
            profileUrl: payload.profileUrl
              ? String(payload.profileUrl)
              : undefined,
            inviteText: payload.inviteText
              ? String(payload.inviteText)
              : undefined,
            text: messageText,
            dryRun:
              payload.dryRun === true
          });

        if (
          result.deliveryMode === "email" &&
          result.publicEmail &&
          payload.dryRun !== true
        ) {

          console.log(
            `LinkedIn unavailable; verified public email fallback=${result.publicEmail}`
          );

          const emailResult =
            await this.gmail.execute(
              "gmail.send",
              {
                to: result.publicEmail,
                subject: company
                  ? `Helping ${company} fill open roles`
                  : "Helping fill your open roles",
                body: messageText
              }
            );

          /*
           * Positive email-delivery evidence only.
           *
           * A browser click or a non-throwing MCP call is not
           * sufficient. Search the returned structured response
           * for an explicit successful execution plus delivery
           * evidence such as a message/thread identifier or a
           * provider statement that the email was sent.
           */
          const inspectEmailResult =
            (
              value: unknown
            ): {
              failure: boolean;
              success: boolean;
              evidence: boolean;
            } => {
              let failure = false;
              let success = false;
              let evidence = false;

              const visit =
                (node: unknown) => {
                  if (
                    node === null ||
                    node === undefined
                  ) {
                    return;
                  }

                  if (
                    typeof node === "string"
                  ) {
                    const text =
                      node.toLowerCase();

                    if (
                      /failed|failure|not sent|could not send|unable to send|error/.test(
                        text
                      )
                    ) {
                      failure = true;
                    }

                    if (
                      /successfully sent|email sent|message sent|sent successfully/.test(
                        text
                      )
                    ) {
                      success = true;
                      evidence = true;
                    }

                    return;
                  }

                  if (
                    typeof node !== "object"
                  ) {
                    return;
                  }

                  if (Array.isArray(node)) {
                    for (const item of node) {
                      visit(item);
                    }
                    return;
                  }

                  const obj =
                    node as Record<
                      string,
                      unknown
                    >;

                  if (
                    obj.success === false ||
                    obj.successful === false ||
                    obj.ok === false ||
                    obj.isError === true
                  ) {
                    failure = true;
                  }

                  if (
                    obj.success === true ||
                    obj.successful === true ||
                    obj.ok === true
                  ) {
                    success = true;
                  }

                  for (
                    const [key, child]
                    of Object.entries(obj)
                  ) {
                    const normalizedKey =
                      key
                        .replace(/[^a-z0-9]/gi, "")
                        .toLowerCase();

                    if (
                      child &&
                      (
                        normalizedKey === "messageid" ||
                        normalizedKey === "threadid" ||
                        normalizedKey === "emailid" ||
                        normalizedKey === "gmailmessageid"
                      )
                    ) {
                      evidence = true;
                    }

                    visit(child);
                  }
                };

              visit(value);

              return {
                failure,
                success,
                evidence
              };
            };

          const emailVerification =
            inspectEmailResult(
              emailResult
            );

          if (
            emailVerification.failure ||
            !emailVerification.success ||
            !emailVerification.evidence
          ) {
            throw new Error(
              `Gmail outreach to ${result.publicEmail} returned without sufficient positive delivery evidence. Refusing false success.`
            );
          }

          console.log(
            `EMAIL_OUTREACH_SENT_AND_VERIFIED=${result.publicEmail}`
          );

          return {
            success: true,
            recipient,
            company,
            conversationVerified: true,
            messageVerified: true,
            dryRun: false,
            deliveryMode: "email",
            publicEmail: result.publicEmail,
            emailResult
          };
        }

        return result;
      }

      case "linkedin.reply":
        return runtime.messaging.reply(
          String(payload.text ?? payload.message ?? "")
        );

      case "linkedin.inbox":
      case "linkedin.messages":
        return runtime.messaging.list();

      case "linkedin.read":
        return runtime.messaging.read();

      case "linkedin.search":
        return runtime.search.search(
          String(payload.query ?? "")
        );

      case "linkedin.people":
        return runtime.search.people(
          String(payload.query ?? "")
        );

      case "linkedin.companies":
        return runtime.search.companies(
          String(payload.query ?? "")
        );

      case "linkedin.jobs":
        return runtime.search.jobs(
          String(payload.query ?? "")
        );

      case "linkedin.posts":
        return runtime.search.posts(
          String(payload.query ?? "")
        );

      case "linkedin.post":
      case "linkedin.create_post":
        return runtime.feed.createPost({
          text: String(payload.text ?? payload.body ?? payload.content ?? ""),
          images: Array.isArray(payload.images)
            ? payload.images.map(String)
            : undefined,
          videos: Array.isArray(payload.videos)
            ? payload.videos.map(String)
            : undefined
        });

      case "linkedin.recruiters":
        return runtime.search.recruiters(
          String(payload.query ?? "")
        );

      case "linkedin.hiring_managers":
        return runtime.search.hiringManagers(
          String(payload.query ?? "")
        );

      case "linkedin.employees":
        return runtime.search.employees(
          String(payload.company ?? payload.query ?? "")
        );

      case "linkedin.archive":
        return runtime.messaging.archive();

      case "linkedin.delete":
        return runtime.messaging.delete();

      default:
        throw new Error(
          `Unsupported LinkedIn action: ${action}`
        );
    }
  }
}
