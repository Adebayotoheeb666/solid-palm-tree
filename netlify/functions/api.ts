import serverless from "serverless-http";

import { createServer } from "../../server";

let handler: any = null;

export const handler = async (event: any, context: any, callback: any) => {
  if (!handler) {
    const app = await createServer();
    handler = serverless(app);
  }
  return handler(event, context, callback);
};
