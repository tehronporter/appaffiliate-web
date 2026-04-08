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
        title="Sign in to view your creator portal"
        description="Sign in with your invited AppAffiliate account to review your own codes, results, earnings, and payout history."
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
        title="This account is set up for the internal workspace"
        description="The creator portal is limited to linked creator accounts. If you manage AppAffiliate internally, continue in the workspace instead."
        action={
          <ActionLink href="/dashboard" variant="primary">
            Open workspace
          </ActionLink>
        }
      />
    );
  }

  if (!viewer.hasPartnerProfile) {
    return (
      <EmptyState
        eyebrow="Creator setup"
        title="Your creator profile is not linked yet"
        description="This account has portal access, but the matching creator profile has not been linked yet. Your AppAffiliate contact can finish setup."
      />
    );
  }

  if (!viewer.isLinkedToPartner) {
    return (
      <EmptyState
        eyebrow="Creator mapping"
        title="Your portal link is still being finalized"
        description="This account is ready for the creator portal, but it has not been mapped to a specific creator record yet. Once that link is added, your codes, results, and payouts will appear automatically."
      />
    );
  }

  return null;
}
