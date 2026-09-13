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
    "../src/posts/post-service.ts"
  ),
  "utf8"
);

test("Reddit keeps deterministic title verification", () => {
  assert.match(
    source,
    /Reddit title filled and verified/
  );

  assert.match(
    source,
    /textarea\[name="title"\]/
  );
});

test("Reddit keeps adaptive visible body editor", () => {
  assert.match(
    source,
    /Reddit live body editor resolved/
  );

  assert.match(source, /bestScore/);

  assert.doesNotMatch(
    source,
    /locator\('\[contenteditable="true"\]'\)\s*\.last\(\)/
  );
});

test("Reddit keeps body verification", () => {
  assert.match(
    source,
    /Reddit post body filled and verified/
  );

  assert.match(
    source,
    /normalize\(actual\)/
  );
});

test("Reddit keeps real Post activation", () => {
  assert.match(
    source,
    /await postButton\.click/
  );

  assert.match(
    source,
    /Post submission activated/
  );
});

test("Reddit DOM confirmation is subreddit scoped", () => {
  assert.match(
    source,
    /a\[href\*="\/r\/\$\{post\.subreddit\}\/comments\/"\]/
  );

  assert.doesNotMatch(
    source,
    /'a\[href\*="\/comments\/"\]'/
  );
});

test("Reddit created-id confirmation requires expected subreddit", () => {
  assert.match(
    source,
    /currentPathMatchesSubreddit/
  );

  assert.match(
    source,
    /expectedSubredditPath/
  );

  assert.match(
    source,
    /createdMatch &&\s*currentPathMatchesSubreddit/
  );
});
