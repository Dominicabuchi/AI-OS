import "dotenv/config";

export function getConfig() {

  const openRouterApiKey = process.env.OPENROUTER_API_KEY;

  if (!openRouterApiKey) {
    throw new Error(
      "OPENROUTER_API_KEY is missing."
    );
  }

  return {
    openRouterApiKey
  };

}
