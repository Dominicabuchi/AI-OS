import {
  ElementNode,
  SearchRequest
} from "./types";

export interface RankedCandidate {

  element: ElementNode;

  score: number;

}

export class Strategy {

  rank(
    elements: ElementNode[],
    request: SearchRequest
  ): RankedCandidate[] {

    const isFill =
      request.value !== undefined;

    const ranked =
      elements

        .filter(element => {

          if (!element.visible) {
            return false;
          }

          if (!element.enabled) {
            return false;
          }

          if (!isFill) {
            return true;
          }

          return (

            element.editable ||

            element.tag === "input" ||

            element.tag === "textarea" ||

            element.attributes["contenteditable"] === "true"

          );

        })

        .map(element => ({

          element,

          score:
            this.score(
              element,
              request
            )

        }))

        .filter(
          candidate =>
            candidate.score > 0
        )

        .sort(
          (a, b) =>
            b.score - a.score
        );

    console.log("");
    console.log("========== RANKED CANDIDATES ==========");

    console.table(

      ranked.slice(0, 15).map(candidate => ({

        score:
          candidate.score,

        tag:
          candidate.element.tag,

        role:
          candidate.element.role,

        text:
          candidate.element.text,

        aria:
          candidate.element.ariaLabel,

        placeholder:
          candidate.element.placeholder,

        editable:
          candidate.element.editable,

        enabled:
          candidate.element.enabled

      }))

    );

    return ranked;

  }

  private similarity(
    a: string,
    b: string
  ): number {

    if (!a || !b) {
      return 0;
    }

    if (a === b) {
      return 1;
    }

    if (a.includes(b) || b.includes(a)) {
      return 0.8;
    }

    const aw =
      new Set(
        a.split(/\s+/)
      );

    const bw =
      new Set(
        b.split(/\s+/)
      );

    let overlap = 0;

    for (const word of aw) {

      if (bw.has(word)) {
        overlap++;
      }

    }

    return overlap /
      Math.max(
        aw.size,
        bw.size
      );

  }

  private score(
    element: ElementNode,
    request: SearchRequest
  ): number {

    let score = 0;

    //
    // Action-aware scoring
    //

    const action =
      request.action.toLowerCase();

    const isClickAction =

      action.includes("click") ||

      action.includes("tab") ||

      action.includes("button") ||

      action.includes("submit") ||

      action.includes("open") ||

      action.includes("menu");

    const isFillAction =

      request.value !== undefined ||

      action.includes("fill") ||

      action.includes("title") ||

      action.includes("url") ||

      action.includes("link") ||

      action.includes("body") ||

      action.includes("search");

    if (isClickAction) {

      if (
        element.tag === "button" ||
        element.tag === "a"
      ) {
        score += 600;
      }

      if (
        element.role === "button" ||
        element.role === "tab" ||
        element.role === "link"
      ) {
        score += 600;
      }

      if (element.editable) {
        score -= 500;
      }

    }

    if (isFillAction) {

      if (element.editable) {
        score += 700;
      }

      if (
        element.tag === "input" ||
        element.tag === "textarea"
      ) {
        score += 300;
      }

    }


    const normalize =
      (value?: string) =>
        (value ?? "")
          .trim()
          .toLowerCase();

    const description =
      normalize(
        request.description
      );

    const requestText =
      normalize(
        request.text
      );

    const role =
      normalize(
        request.role
      );

    const text =
      normalize(
        element.text
      );

    const aria =
      normalize(
        element.ariaLabel
      );

    const placeholder =
      normalize(
        element.placeholder
      );

    if (
      role &&
      normalize(element.role) === role
    ) {
      score += 150;
    }

    score +=
      this.similarity(
        aria,
        description
      ) * 300;

    score +=
      this.similarity(
        placeholder,
        description
      ) * 260;

    score +=
      this.similarity(
        text,
        description
      ) * 220;

    score +=
      this.similarity(
        text,
        requestText
      ) * 180;

    if (element.editable) {
      score += 200;
    }

    if (element.tag === "input") {
      score += 120;
    }

    if (element.tag === "textarea") {
      score += 120;
    }

    if (element.bounds.width > 0) {
      score += 10;
    }

    if (element.bounds.height > 0) {
      score += 10;
    }

    return score;

  }

}
