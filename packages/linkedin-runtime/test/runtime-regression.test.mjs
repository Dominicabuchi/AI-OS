import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(
  fileURLToPath(import.meta.url)
);

const source = fs.readFileSync(
  path.resolve(
    here,
    "../src/feed/linkedin-feed.ts"
  ),
  "utf8"
);

test("LinkedIn keeps adaptive composer opener discovery", () => {
  assert.match(source, /createPostCandidates/);
  assert.match(source, /start a post\|create a post/i);
  assert.match(source, /isVisible/);
});

test("LinkedIn keeps live semantic editor discovery", () => {
  assert.match(
    source,
    /LinkedIn live editor resolved dynamically/
  );

  assert.match(
    source,
    /textarea, \[role="textbox"\], \[contenteditable\]/
  );

  assert.match(source, /editorScore/);
  assert.match(source, /inDialog/);
});

test("LinkedIn keeps editor content verification", () => {
  assert.match(
    source,
    /LinkedIn post editor filled and verified/
  );

  assert.match(source, /enteredText/);
  assert.match(source, /normalizeEditorText/);
});

test("LinkedIn keeps authentication challenge protection", () => {
  assert.match(
    source,
    /checkpoint/
  );

  assert.match(
    source,
    /challenge/
  );
});
