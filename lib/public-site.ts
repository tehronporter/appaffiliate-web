export const publicNavLinks: Array<{ href: string; label: string }> = [
  { href: "/product", label: "Product" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/security", label: "Security" },
  { href: "/docs", label: "Docs" },
  { href: "/login", label: "Sign in" },
];

export const publicFooterLinks: Array<{ href: string; label: string }> = [
  { href: "/", label: "Home" },
  { href: "/product", label: "Product" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/security", label: "Security" },
  { href: "/docs", label: "Docs" },
  { href: "/login", label: "Sign in" },
  { href: "/request-access", label: "Request access" },
];

export const publicPrimaryAction = {
  href: "/request-access",
  label: "Request access",
  variant: "primary" as const,
};

export const publicSecondaryAction = {
  href: "/login",
  label: "Sign in",
  variant: "secondary" as const,
};
