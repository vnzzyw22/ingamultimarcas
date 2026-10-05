"use client";

import { motion } from "framer-motion";

/** Transição entre páginas: fade curto, sem deslocamento (não atrasa leitura). */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.28, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}
