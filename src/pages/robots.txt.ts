import type { APIRoute } from 'astro';

// Gerado no build para que a linha Sitemap aponte para o domínio real,
// e não para uma URL chumbada que fica errada ao trocar de domínio.
export const GET: APIRoute = ({ site }) => {
  const body = `User-agent: *
Allow: /

Sitemap: ${new URL('sitemap-index.xml', site).href}
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
