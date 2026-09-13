import fs from "fs";

import {
  SearchRequest
} from "../types";

export interface VisionCandidate {

  description: string;

  confidence: number;

  x: number;

  y: number;

  width: number;

  height: number;

}

export class VisionAnalyzer {

  async analyze(

    image: string,

    request: SearchRequest

  ): Promise<VisionCandidate[]> {

    console.log("");
    console.log("========== VISION ==========");
    console.log("Image:", image);
    console.log("Target:", request.description);

    if (!fs.existsSync(image)) {

      console.log("Screenshot missing.");

      return [];

    }

    const stat =
      fs.statSync(image);

    console.log(
      "Screenshot size:",
      stat.size,
      "bytes"
    );

    // Phase 1:
    // Produce a generic full-page candidate.
    // Later this becomes Gemini/OpenAI/Qwen-VL.

    return [

      {

        description:
          request.description,

        confidence: 0.50,

        x: 0,

        y: 0,

        width: 100000,

        height: 100000

      }

    ];

  }

}
