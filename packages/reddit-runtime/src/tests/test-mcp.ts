import { RedditMCP } from "../mcp";

async function main() {

  const reddit = new RedditMCP();

  console.log("");
  console.log("=================================");
  console.log("CONNECTING TO REDDIT MCP");
  console.log("=================================");

  const tools = await reddit.listTools();

  console.dir(
    tools,
    {
      depth: null,
      colors: true
    }
  );

}

main().catch(console.error);
