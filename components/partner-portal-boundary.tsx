import { ActionLink } from "@/components/app-shell";
import { EmptyState } from "@/components/admin-ui";
import type { PortalViewerState } from "@/lib/services/portal";

type PartnerPortalBoundaryProps = {
  viewer: PortalViewerState;
};

export function PartnerPortalBoundary({ viewer }: PartnerPortalBoundaryProps) {
  if (!viewer.isAuthenticated) {
    return (
      <EmptyState
        eyebrow="Sign in required"
        title="Sign in to open the partner portal"
        description="Sign in with your invited AppAffiliate account, then return to the portal to review your own codes, performance, and payout status."
        action={
          <ActionLink href="/login?redirectTo=/portal" variant="primary">
            Sign in
          </ActionLink>
        }
      />
    );
  }

  if (!viewer.hasPortalRole) {
    return (
      <EmptyState
        eyebrow="Portal access"
        title="This account uses the internal workspace"
        description="Partner portal views are limited to linked partner accounts. Internal workspace users should continue in the admin app."
        action={
          <ActionLink href="/dashboard" variant="primary">
            Open admin workspace
          </ActionLink>
        }
      />
    );
  }

  if (!viewer.hasPartnerProfile) {
    return (
      <EmptyState
        eyebrow="Partner access"
        title="No partner profile is linked yet"
        description="This account has partner portal access, but the matching partner profile has not been linked yet. Your AppAffiliate contact can finish setup."
      />
    );
  }

  if (!viewer.isLinkedToPartner) {
    return (
      <EmptyState
        eyebrow="Partner mapping"
        title="Your portal link is still being finalized"
        description="This account is ready for the partner portal, but it has not been mapped to a specific partner record yet. Once the link is added, your portal data will appear automatically."
      />
    );
  }

  return null;
}
