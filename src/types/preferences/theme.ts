/* eslint-disable max-lines */
export const THEME_MODE_OPTIONS = [
  {
    label: "Light",
    value: "light",
  },
  {
    label: "Dark",
    value: "dark",
  },
] as const;

export const THEME_MODE_VALUES = THEME_MODE_OPTIONS.map((m) => m.value);

export type ThemeMode = (typeof THEME_MODE_VALUES)[number];

// --- generated:themePresets:start ---

export const THEME_PRESET_OPTIONS = [
  {
    label: "Default",
    value: "default",
    primary: {
      light: "",
      dark: "",
    },
  },
  {
    label: "Amber Minimal",
    value: "amber-minimal",
    primary: {
      light: "oklch(0.7686 0.1647 70.0804)",
      dark: "oklch(0.7686 0.1647 70.0804)",
    },
  },
  {
    label: "Amethyst Haze",
    value: "amethyst-haze",
    primary: {
      light: "oklch(0.6104 0.0767 299.7335)",
      dark: "oklch(0.7058 0.0777 302.0489)",
    },
  },
  {
    label: "Bold Tech",
    value: "bold-tech",
    primary: {
      light: "oklch(0.6056 0.2189 292.7172)",
      dark: "oklch(0.6056 0.2189 292.7172)",
    },
  },
  {
    label: "Brutalist",
    value: "brutalist",
    primary: {
      light: "oklch(0.6489 0.237 26.9728)",
      dark: "oklch(0.7044 0.1872 23.1858)",
    },
  },
  {
    label: "Bubblegum",
    value: "bubblegum",
    primary: {
      light: "oklch(0.6209 0.1801 348.1385)",
      dark: "oklch(0.9195 0.0801 87.667)",
    },
  },
  {
    label: "Caffeine",
    value: "caffeine",
    primary: {
      light: "oklch(0.4341 0.0392 41.9938)",
      dark: "oklch(0.9247 0.0524 66.1732)",
    },
  },
  {
    label: "Candyland",
    value: "candyland",
    primary: {
      light: "oklch(0.8677 0.0735 7.0855)",
      dark: "oklch(0.8027 0.1355 349.2347)",
    },
  },
  {
    label: "Catppuccin",
    value: "catppuccin",
    primary: {
      light: "oklch(0.5547 0.2503 297.0156)",
      dark: "oklch(0.7871 0.1187 304.7693)",
    },
  },
  {
    label: "Claude",
    value: "claude",
    primary: {
      light: "oklch(0.6171 0.1375 39.0427)",
      dark: "oklch(0.6724 0.1308 38.7559)",
    },
  },
  {
    label: "Claymorphism",
    value: "claymorphism",
    primary: {
      light: "oklch(0.5854 0.2041 277.1173)",
      dark: "oklch(0.6801 0.1583 276.9349)",
    },
  },
  {
    label: "Clean Slate",
    value: "clean-slate",
    primary: {
      light: "oklch(0.5854 0.2041 277.1173)",
      dark: "oklch(0.6801 0.1583 276.9349)",
    },
  },
  {
    label: "Cosmic Night",
    value: "cosmic-night",
    primary: {
      light: "oklch(0.5417 0.179 288.0332)",
      dark: "oklch(0.7162 0.1597 290.3962)",
    },
  },
  {
    label: "Cyberpunk",
    value: "cyberpunk",
    primary: {
      light: "oklch(0.6726 0.2904 341.4084)",
      dark: "oklch(0.6726 0.2904 341.4084)",
    },
  },
  {
    label: "Dark Matter",
    value: "darkmatter",
    primary: {
      light: "oklch(0.6716 0.1368 48.513)",
      dark: "oklch(0.7214 0.1337 49.9802)",
    },
  },
  {
    label: "Doom 64",
    value: "doom-64",
    primary: {
      light: "oklch(0.5016 0.1887 27.4816)",
      dark: "oklch(0.6083 0.209 27.0276)",
    },
  },
  {
    label: "Elegant Luxury",
    value: "elegant-luxury",
    primary: {
      light: "oklch(0.465 0.147 24.9381)",
      dark: "oklch(0.5054 0.1905 27.5181)",
    },
  },
  {
    label: "Graphite",
    value: "graphite",
    primary: {
      light: "oklch(0.4891 0 0)",
      dark: "oklch(0.7058 0 0)",
    },
  },
  {
    label: "Kodama Grove",
    value: "kodama-grove",
    primary: {
      light: "oklch(0.6657 0.105 118.9078)",
      dark: "oklch(0.6762 0.0567 132.4479)",
    },
  },
  {
    label: "Midnight Bloom",
    value: "midnight-bloom",
    primary: {
      light: "oklch(0.5676 0.2021 283.0838)",
      dark: "oklch(0.5676 0.2021 283.0838)",
    },
  },
  {
    label: "Mocha Mousse",
    value: "mocha-mousse",
    primary: {
      light: "oklch(0.6083 0.0623 44.3588)",
      dark: "oklch(0.7272 0.0539 52.332)",
    },
  },
  {
    label: "Modern Minimal",
    value: "modern-minimal",
    primary: {
      light: "oklch(0.6231 0.188 259.8145)",
      dark: "oklch(0.6231 0.188 259.8145)",
    },
  },
  {
    label: "Mono",
    value: "mono",
    primary: {
      light: "oklch(0.5555 0 0)",
      dark: "oklch(0.5555 0 0)",
    },
  },
  {
    label: "Nature",
    value: "nature",
    primary: {
      light: "oklch(0.5234 0.1347 144.1672)",
      dark: "oklch(0.6731 0.1624 144.2083)",
    },
  },
  {
    label: "Northern Lights",
    value: "northern-lights",
    primary: {
      light: "oklch(0.6487 0.1538 150.3071)",
      dark: "oklch(0.6487 0.1538 150.3071)",
    },
  },
  {
    label: "Notebook",
    value: "notebook",
    primary: {
      light: "oklch(0.4891 0 0)",
      dark: "oklch(0.7572 0 0)",
    },
  },
  {
    label: "Ocean Breeze",
    value: "ocean-breeze",
    primary: {
      light: "oklch(0.7227 0.192 149.5793)",
      dark: "oklch(0.7729 0.1535 163.2231)",
    },
  },
  {
    label: "Pastel Dreams",
    value: "pastel-dreams",
    primary: {
      light: "oklch(0.709 0.1592 293.5412)",
      dark: "oklch(0.7874 0.1179 295.7538)",
    },
  },
  {
    label: "Perpetuity",
    value: "perpetuity",
    primary: {
      light: "oklch(0.5624 0.0947 203.2755)",
      dark: "oklch(0.852 0.1269 195.0354)",
    },
  },
  {
    label: "Quantum Rose",
    value: "quantum-rose",
    primary: {
      light: "oklch(0.6002 0.2414 0.1348)",
      dark: "oklch(0.7543 0.2319 332.0212)",
    },
  },
  {
    label: "Retro Arcade",
    value: "retro-arcade",
    primary: {
      light: "oklch(0.5924 0.2025 355.8943)",
      dark: "oklch(0.5924 0.2025 355.8943)",
    },
  },
  {
    label: "Soft Pop",
    value: "soft-pop",
    primary: {
      light: "oklch(0.5106 0.2301 276.9656)",
      dark: "oklch(0.6801 0.1583 276.9349)",
    },
  },
  {
    label: "Solar Dusk",
    value: "solar-dusk",
    primary: {
      light: "oklch(0.5553 0.1455 48.9975)",
      dark: "oklch(0.7049 0.1867 47.6044)",
    },
  },
  {
    label: "Starry Night",
    value: "starry-night",
    primary: {
      light: "oklch(0.4815 0.1178 263.3758)",
      dark: "oklch(0.4815 0.1178 263.3758)",
    },
  },
  {
    label: "Sunset Horizon",
    value: "sunset-horizon",
    primary: {
      light: "oklch(0.7357 0.1641 34.7091)",
      dark: "oklch(0.7357 0.1641 34.7091)",
    },
  },
  {
    label: "Supabase",
    value: "supabase",
    primary: {
      light: "oklch(0.8348 0.1302 160.908)",
      dark: "oklch(0.4365 0.1044 156.7556)",
    },
  },
  {
    label: "T3 Chat",
    value: "t3-chat",
    primary: {
      light: "oklch(0.5316 0.1409 355.1999)",
      dark: "oklch(0.4607 0.1853 4.0994)",
    },
  },
  {
    label: "Tangerine",
    value: "tangerine",
    primary: {
      light: "oklch(0.64 0.17 36.44)",
      dark: "oklch(0.64 0.17 36.44)",
    },
  },
  {
    label: "Twitter",
    value: "twitter",
    primary: {
      light: "oklch(0.6723 0.1606 244.9955)",
      dark: "oklch(0.6692 0.1607 245.011)",
    },
  },
  {
    label: "Vercel",
    value: "vercel",
    primary: {
      light: "oklch(0 0 0)",
      dark: "oklch(1 0 0)",
    },
  },
  {
    label: "Vintage Paper",
    value: "vintage-paper",
    primary: {
      light: "oklch(0.618 0.0778 65.5444)",
      dark: "oklch(0.7264 0.0581 66.6967)",
    },
  },
  {
    label: "Violet Bloom",
    value: "violet-bloom",
    primary: {
      light: "oklch(0.5393 0.2713 286.7462)",
      dark: "oklch(0.6132 0.2294 291.7437)",
    },
  },
] as const;

export const THEME_PRESET_VALUES = THEME_PRESET_OPTIONS.map((p) => p.value);

export type ThemePreset = (typeof THEME_PRESET_OPTIONS)[number]["value"];

// --- generated:themePresets:end ---
