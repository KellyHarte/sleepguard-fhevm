import crypto from "crypto";

// Calculate deterministic seed for unique design system
const projectName = "SleepGuard";
const network = "sepolia";
const yearMonth = "202510";
const contractName = "SleepGuard.sol";
const seedString = `${projectName}${network}${yearMonth}${contractName}`;
const seedHash = crypto.createHash("sha256").update(seedString).digest("hex");
const seed = parseInt(seedHash.substring(0, 8), 16);

// Design system selection based on seed
// seed = 2100013612
// Design system: 2100013612 % 5 = 2 -> Glassmorphism
// Color scheme: 2100013612 % 8 = 4 -> G (Red/Pink/Orange)
// Typography: 2100013612 % 3 = 0 -> Sans-Serif
// Layout: Grid
// Transitions: 200ms (standard)

export const designTokens = {
  seed: seedHash,
  seedNumber: seed,
  system: "Glassmorphism",
  
  colors: {
    light: {
      primary: "#EF4444",       // Red
      secondary: "#EC4899",     // Pink
      accent: "#F97316",        // Orange
      background: "#FFFFFF",
      surface: "#FAFAFA",
      surfaceAlt: "#F5F5F5",
      text: "#0F172A",
      textSecondary: "#64748B",
      textMuted: "#94A3B8",
      border: "#E5E7EB",
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
      info: "#3B82F6",
    },
    dark: {
      primary: "#F87171",       // Lighter Red for dark mode
      secondary: "#F472B6",     // Lighter Pink
      accent: "#FB923C",        // Lighter Orange
      background: "#0F172A",
      surface: "#1E293B",
      surfaceAlt: "#334155",
      text: "#F8FAFC",
      textSecondary: "#CBD5E1",
      textMuted: "#94A3B8",
      border: "#334155",
      success: "#34D399",
      warning: "#FBBF24",
      error: "#F87171",
      info: "#60A5FA",
    },
  },
  
  typography: {
    fontFamily: {
      sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      mono: ["JetBrains Mono", "Fira Code", "monospace"],
    },
    scale: 1.25, // Major third scale
    sizes: {
      xs: "0.75rem",      // 12px
      sm: "0.875rem",     // 14px
      base: "1rem",       // 16px
      lg: "1.25rem",      // 20px
      xl: "1.563rem",     // 25px
      "2xl": "1.953rem",  // 31px
      "3xl": "2.441rem",  // 39px
      "4xl": "3.052rem",  // 49px
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeights: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  spacing: {
    unit: 8, // Base spacing unit: 8px
    xs: "0.25rem",   // 4px
    sm: "0.5rem",    // 8px
    md: "1rem",      // 16px
    lg: "1.5rem",    // 24px
    xl: "2rem",      // 32px
    "2xl": "3rem",   // 48px
    "3xl": "4rem",   // 64px
  },
  
  borderRadius: {
    none: "0",
    sm: "0.25rem",   // 4px
    md: "0.5rem",    // 8px
    lg: "0.75rem",   // 12px - Primary choice
    xl: "1rem",      // 16px
    "2xl": "1.5rem", // 24px
    full: "9999px",
  },
  
  shadows: {
    none: "none",
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)", // Primary
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
  },
  
  glassmorphism: {
    // Glassmorphism-specific properties
    blur: {
      sm: "blur(4px)",
      md: "blur(8px)",
      lg: "blur(12px)",
      xl: "blur(16px)",
    },
    opacity: {
      low: "0.7",
      medium: "0.8",
      high: "0.9",
    },
    border: "1px solid rgba(255, 255, 255, 0.18)",
  },
  
  transitions: {
    duration: {
      fast: "100ms",
      normal: "200ms",   // Primary choice
      slow: "300ms",
    },
    easing: {
      default: "cubic-bezier(0.4, 0, 0.2, 1)",
      in: "cubic-bezier(0.4, 0, 1, 1)",
      out: "cubic-bezier(0, 0, 0.2, 1)",
      inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
  },
  
  layout: {
    mode: "grid",
    maxWidth: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    breakpoints: {
      mobile: "0px",      // < 768px
      tablet: "768px",    // 768px - 1024px
      desktop: "1024px",  // > 1024px
    },
    gridCols: 12,
  },
  
  density: {
    compact: {
      padding: {
        sm: "0.25rem 0.5rem",   // 4px 8px
        md: "0.5rem 1rem",      // 8px 16px
        lg: "0.75rem 1.5rem",   // 12px 24px
      },
      gap: "0.5rem", // 8px
      itemHeight: {
        sm: "2rem",    // 32px
        md: "2.5rem",  // 40px
        lg: "3rem",    // 48px
      },
    },
    comfortable: {
      padding: {
        sm: "0.5rem 1rem",      // 8px 16px
        md: "1rem 1.5rem",      // 16px 24px
        lg: "1.25rem 2rem",     // 20px 32px
      },
      gap: "1rem", // 16px
      itemHeight: {
        sm: "2.5rem",  // 40px
        md: "3rem",    // 48px
        lg: "3.5rem",  // 56px
      },
    },
  },
  
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
};

export type DesignTokens = typeof designTokens;





