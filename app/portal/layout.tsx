import type { ReactNode } from "react";

type PartnerPortalLayoutProps = {
  children: ReactNode;
};

// Reserve the real /portal segment for future partner-facing routes so they
// remain separate from the internal workspace shell.
export default function PartnerPortalLayout({
  children,
}: PartnerPortalLayoutProps) {
  return children;
}
