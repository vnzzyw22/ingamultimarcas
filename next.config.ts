import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Não gerar AGENTS.md/CLAUDE.md automaticamente no `next dev`.
  agentRules: false,
  // Fixa a raiz do projeto: sem isso o Next sobe até o package-lock.json solto na home
  // do usuário e o Turbopack não resolve next/font/google (erro 500 no dev).
  turbopack: { root: process.cwd() },
  images: {
    formats: ["image/avif", "image/webp"],
    // 92 = logo; 75 = padrão do Next para o resto
    qualities: [75, 92],
    // Quando as fotos reais vierem de um CDN/storage, registre o host aqui.
    remotePatterns: [],
  },
};

export default nextConfig;
