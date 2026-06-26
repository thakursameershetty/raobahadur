export const runtime = 'edge';

export async function POST(req) {
  const apiKey = process.env.AZURE_API_KEY || req.headers.get('x-api-key');
  const endpoint = process.env.AZURE_ENDPOINT || req.headers.get('x-endpoint');
  const deployment = process.env.AZURE_DEPLOYMENT || req.headers.get('x-deployment') || 'gpt-image-2';

  if (!apiKey || !endpoint) {
    return new Response(JSON.stringify({ error: { message: 'Missing headers' } }), { status: 400 });
  }

  const apiVersion = '2025-04-01-preview';
  const url = new URL(endpoint);
  const targetUrl = `${url.origin}/openai/deployments/${deployment}/images/edits?api-version=${apiVersion}`;

  const proxyReqHeaders = new Headers();
  proxyReqHeaders.set('api-key', apiKey);
  const contentType = req.headers.get('content-type');
  if (contentType) proxyReqHeaders.set('content-type', contentType);

  const bodyBuffer = await req.arrayBuffer();

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      
      // Keep alive: send a space every 10 seconds to bypass Vercel's 25s limit
      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(" "));
      }, 10000);

      try {
        const proxyRes = await fetch(targetUrl, {
          method: 'POST',
          headers: proxyReqHeaders,
          body: bodyBuffer,
          duplex: 'half'
        });

        const data = await proxyRes.text();
        controller.enqueue(encoder.encode(data));
      } catch (err) {
        controller.enqueue(encoder.encode(JSON.stringify({ error: { message: err.message } })));
      } finally {
        clearInterval(keepAlive);
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'x-api-key, x-endpoint, x-deployment, x-api-version, content-type',
    }
  });
}
