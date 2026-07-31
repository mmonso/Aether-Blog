// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// A URL canônica do site. É ela que alimenta as tags <link rel="canonical">,
// as og:url e o sitemap.xml — se estiver errada, o Google e as prévias de
// link apontam para o lugar errado.
//
// Ordem: SITE_URL (definida à mão) > domínio de produção que a própria
// Vercel injeta no build > localhost, para `astro build` na sua máquina.
const site =
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:4321');

export default defineConfig({
  site,
  // Site 100% estático: o HTML de cada artigo é gerado no build, com o texto
  // dentro dele. É o que faz o Google e as prévias do WhatsApp/LinkedIn
  // enxergarem conteúdo em vez de uma <div> vazia.
  output: 'static',
  // URLs sem barra no fim: é o que sai nos links, no canonical e no sitemap.
  //
  // O formato de build é o padrão do Astro (`directory`), que gera
  // `artigo/slug/index.html`. Já tentamos `file` — `artigo/slug.html` — e a
  // Vercel devolveu 404 em `/artigo/slug`, porque servir um `.html` numa URL
  // sem extensão depende de configuração da hospedagem. Índice de diretório
  // é resolvido nativamente por qualquer servidor estático, sem combinado.
  trailingSlash: 'never',
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
