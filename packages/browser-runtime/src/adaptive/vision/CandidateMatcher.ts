import {
  ElementNode
} from "../types";

import {
  VisionCandidate
} from "./VisionAnalyzer";

export class CandidateMatcher {

  match(

    candidates: VisionCandidate[],

    elements: ElementNode[]

  ): ElementNode | null {

    let best:
      ElementNode | null = null;

    let bestScore = -1;

    for (const candidate of candidates) {

      for (const element of elements) {

        if (!element.visible) {
          continue;
        }

        let score = 0;

        const cx =
          candidate.x + candidate.width / 2;

        const cy =
          candidate.y + candidate.height / 2;

        const ex =
          element.bounds.x +
          element.bounds.width / 2;

        const ey =
          element.bounds.y +
          element.bounds.height / 2;

        const distance =
          Math.hypot(
            cx - ex,
            cy - ey
          );

        score +=
          Math.max(
            0,
            1000 - distance
          );

        if (
          element.text &&
          candidate.description &&
          element.text
            .toLowerCase()
            .includes(
              candidate.description.toLowerCase()
            )
        ) {
          score += 500;
        }

        if (
          score > bestScore
        ) {

          bestScore = score;

          best = element;

        }

      }

    }

    return best;

  }

}
