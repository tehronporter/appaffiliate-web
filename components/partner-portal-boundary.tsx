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
        description="Use the same AppAffiliate login flow, then return to the portal to view your own codes, performance, and payout status."
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
        eyebrow="Portal boundary"
        title="This account is not using the partner portal role"
        description="Internal workspace users stay in the admin app. Partner portal views are limited to linked partner_user accounts."
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
        description="A partner_user membership exists, but the matching partner profile has not been attached to this auth user yet."
      />
    );
  }

  if (!viewer.isLinkedToPartner) {
    return (
      <EmptyState
        eyebrow="Partner mapping"
        title="Your portal link is still being finalized"
        description="This account is authenticated for the partner portal, but it has not been mapped to a specific partner record yet. Once the link is added, portal data will appear automatically."
      />
    );
  }

  return null;
}
