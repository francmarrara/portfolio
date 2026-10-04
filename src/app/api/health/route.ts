// Prerendered at build time: answering 200 means the deployment is reachable from the CDN.
export const dynamic = 'force-static';

export function GET() {
  return Response.json({ status: 'ok' });
}
