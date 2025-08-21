import { VercelRequest, VercelResponse } from '@vercel/node';
import { createServer } from '../server';

let app: any = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!app) {
    app = await createServer();
  }
  // Let Express handle the request
  app(req, res);
}
