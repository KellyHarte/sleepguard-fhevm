import type { Config } from "tailwindcss";
import { designTokens } from "./design-tokens";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: designTokens.colors.light.primary,
          dark: designTokens.colors.dark.primary,
        },
        secondary: {
          DEFAULT: designTokens.colors.light.secondary,
          dark: designTokens.colors.dark.secondary,
        },
        accent: {
          DEFAULT: designTokens.colors.light.accent,
          dark: designTokens.colors.dark.accent,
        },
        surface: {
          DEFAULT: designTokens.colors.light.surface,
          alt: designTokens.colors.light.surfaceAlt,
          dark: designTokens.colors.dark.surface,
          darkAlt: designTokens.colors.dark.surfaceAlt,
        },
      },
      fontFamily: {
        sans: designTokens.typography.fontFamily.sans,
        mono: designTokens.typography.fontFamily.mono,
      },
      fontSize: designTokens.typography.sizes,
      borderRadius: {
        DEFAULT: designTokens.borderRadius.lg,
        ...designTokens.borderRadius,
      },
      boxShadow: designTokens.shadows,
      spacing: {
        xs: designTokens.spacing.xs,
        sm: designTokens.spacing.sm,
        md: designTokens.spacing.md,
        lg: designTokens.spacing.lg,
        xl: designTokens.spacing.xl,
        "2xl": designTokens.spacing["2xl"],
        "3xl": designTokens.spacing["3xl"],
      },
      transitionDuration: {
        DEFAULT: designTokens.transitions.duration.normal,
      },
      transitionTimingFunction: {
        DEFAULT: designTokens.transitions.easing.default,
      },
      backdropBlur: {
        glass: designTokens.glassmorphism.blur.md,
        "glass-sm": designTokens.glassmorphism.blur.sm,
        "glass-lg": designTokens.glassmorphism.blur.lg,
      },
    },
  },
  plugins: [],
};

export default config;

