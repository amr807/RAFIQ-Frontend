import { Variants } from "framer-motion";

export const fadeIn = (delay: number): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delay,
      duration: 0.8,
    },
  },
});

export const slideInFromLeft = (delay: number): Variants => ({
  hidden: { x: -100, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      delay,
      duration: 0.8,
    },
  },
});