/**
 * Theme utilities for @shellui/sdk Appearance.
 * Applies colors and typography (including fontFamily) to the document for shadcn/Tailwind.
 */

/**
 * Apply CSS variables to document root.
 * @param {HTMLElement} root
 * @param {Record<string, string>} variables - keys are CSS var names (e.g. '--background')
 */
export function applyVariablesToRoot(root, variables) {
  for (const [key, value] of Object.entries(variables)) {
    if (value != null && key.startsWith("--")) {
      root.style.setProperty(key, value);
    }
  }
}

const TYPOGRAPHY_VARS = [
  "--font-family",
  "--font-body",
  "--font-heading",
  "--line-height",
  "--letter-spacing",
];

/**
 * Apply Appearance typography to root and body.
 * Sets --font-family (Tailwind/shadcn), --font-body, --font-heading, --line-height, --letter-spacing.
 * Uses bodyFontFamily ?? fontFamily, headingFontFamily ?? fontFamily so fontFamily is used when specific fonts are not set.
 * Clears any typography variable not provided by the new appearance so stylesheet defaults apply when switching themes.
 *
 * @param {HTMLElement} root
 * @param {import('@shellui/sdk').Appearance | null} appearance
 */
export function applyTypographyFromAppearance(root, appearance) {
  if (!appearance) {
    TYPOGRAPHY_VARS.forEach((name) => root.style.removeProperty(name));
    if (document.body) document.body.style.removeProperty("font-family");
    return;
  }

  const bodyFont = appearance.bodyFontFamily ?? appearance.fontFamily;
  const headingFont = appearance.headingFontFamily ?? appearance.fontFamily;
  const genericFont = appearance.fontFamily ?? bodyFont;

  if (genericFont != null) {
    root.style.setProperty("--font-family", genericFont);
  } else {
    root.style.removeProperty("--font-family");
  }
  if (bodyFont != null) {
    root.style.setProperty("--font-body", bodyFont);
    if (document.body) document.body.style.setProperty("font-family", bodyFont);
  } else {
    root.style.removeProperty("--font-body");
    if (document.body) document.body.style.removeProperty("font-family");
  }
  if (headingFont != null) {
    root.style.setProperty("--font-heading", headingFont);
  } else {
    root.style.removeProperty("--font-heading");
  }
  if (appearance.lineHeight != null) {
    root.style.setProperty("--line-height", appearance.lineHeight);
  } else {
    root.style.removeProperty("--line-height");
  }
  if (appearance.letterSpacing != null) {
    root.style.setProperty("--letter-spacing", appearance.letterSpacing);
  } else {
    root.style.removeProperty("--letter-spacing");
  }
}

const FONT_LINK_ID = "shellui-theme-fonts";

/**
 * @param {string[] | undefined} urls
 */
export function applyFontFiles(urls) {
  const existing = document.getElementById(FONT_LINK_ID);
  if (existing) existing.remove();
  if (!urls?.length) return;
  for (let i = 0; i < urls.length; i++) {
    const link = document.createElement("link");
    if (i === 0) link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    link.href =
      typeof urls[i] === "string" ? urls[i] : urls[i].href || urls[i].url;
    document.head?.appendChild(link);
  }
}

/** For legacy color-object application (camelCase keys -> --kebab-case). Export for theme.js if needed. */
export const KEY_TO_CSS_VAR = {
  background: "--background",
  foreground: "--foreground",
  card: "--card",
  cardForeground: "--card-foreground",
  popover: "--popover",
  popoverForeground: "--popover-foreground",
  primary: "--primary",
  primaryForeground: "--primary-foreground",
  secondary: "--secondary",
  secondaryForeground: "--secondary-foreground",
  muted: "--muted",
  mutedForeground: "--muted-foreground",
  accent: "--accent",
  accentForeground: "--accent-foreground",
  destructive: "--destructive",
  destructiveForeground: "--destructive-foreground",
  border: "--border",
  input: "--input",
  ring: "--ring",
  radius: "--radius",
  sidebarBackground: "--sidebar",
  sidebarForeground: "--sidebar-foreground",
  sidebarPrimary: "--sidebar-primary",
  sidebarPrimaryForeground: "--sidebar-primary-foreground",
  sidebarAccent: "--sidebar-accent",
  sidebarAccentForeground: "--sidebar-accent-foreground",
  sidebarBorder: "--sidebar-border",
  sidebarRing: "--sidebar-ring",
};
