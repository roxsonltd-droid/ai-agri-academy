"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { easeCinematic, pageEnterFrom, pageEnterReduced, transitionCinematic } from "@/lib/motion";

/**
 * При всяка навигация шаблонът се монтира наново — кинематографски enter (opacity, лек scale, дефокус → фокус).
 */
export default function Template({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="flex w-full min-w-0 flex-1 flex-col"
      initial={reduceMotion ? false : pageEnterFrom}
      animate={pageEnterReduced}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { ...transitionCinematic, ease: easeCinematic }
      }
    >
      {children}
    </motion.div>
  );
}
