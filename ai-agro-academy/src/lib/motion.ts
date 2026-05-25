/**
 * Споделени Framer Motion настройки — премиум / кинематографски easing.
 * В клиентски компоненти ползвай `useReducedMotion()` и задай `initial={reduce ? "show" : "hidden"}` на контейнери със stagger.
 */
export const easeOutExpo = [0.16, 1, 0.3, 1] as const;

/** По-бавен, „кинематографски“ изход от кадър */
export const easeCinematic = [0.22, 1, 0.36, 1] as const;

/** Леко пружиниране за UI акценти */
export const easeLux = [0.33, 1, 0.68, 1] as const;

export const transitionSnappy = {
  duration: 0.36,
  ease: easeLux,
};

export const transitionFast = {
  duration: 0.24,
  ease: easeOutExpo,
};

/** Между страници / тежки панели */
export const transitionCinematic = {
  duration: 0.55,
  ease: easeCinematic,
};

export const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: transitionSnappy,
};

/** Контейнер със staggerChildren за списъци / карти */
export const listContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.06,
    },
  },
};

export const listItemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.44, ease: easeCinematic },
  },
};

/** За `initial="initial"` + `whileInView="animate"` (както на началната страница) */
export const viewportFadeUpVariants = {
  initial: { opacity: 0, y: 28, filter: "blur(8px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.62, ease: easeCinematic },
  },
};

/** Родител за stagger на деца с `viewportFadeUpVariants` */
export const staggerInViewContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.06,
    },
  },
};

/** Enter на цяла страница (template) — scale + blur „фокус“ */
export const pageEnterReduced = { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" };
export const pageEnterFrom = { opacity: 0, y: 16, scale: 0.985, filter: "blur(10px)" };
