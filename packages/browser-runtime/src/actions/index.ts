import { Page } from "playwright";
import { HumanBrowser } from "../human";

function browser(page: Page): HumanBrowser {
  return new HumanBrowser(page);
}

export async function goto(
  page: Page,
  url: string
): Promise<void> {
  await browser(page).goto(url);
}

export async function click(
  page: Page,
  selector: string
): Promise<void> {
  await browser(page).click(selector);
}

export async function type(
  page: Page,
  selector: string,
  text: string
): Promise<void> {
  await browser(page).type(selector, text);
}

export async function extract(
  page: Page,
  selector: string
): Promise<string> {
  return browser(page).text(selector);
}
