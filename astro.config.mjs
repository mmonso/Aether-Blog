// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// O tema é resolvido em tempo de build, por alias — não por `if` no runtime.
//
// Consequência que importa: só o tema ativo entra no bundle. Se os temas
// fossem importados todos e escolhidos por condicional, o leitor de um blog
// baixaria o CSS e os componentes dos outros dois.
//
// Blog novo com identidade própria = uma pasta em src/themes/ e esta variável.
// Nenhuma rota, nenhum hook e nenhuma consulta ao banco mudam.
const theme = process.env.BLOG_THEME || 'aether';
const themeDir = fileURLToPath(new URL(`./src/themes/${theme}`, import.meta.url));

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
    resolve: {
      alias: { '@theme': themeDir },
    },
  },
});
