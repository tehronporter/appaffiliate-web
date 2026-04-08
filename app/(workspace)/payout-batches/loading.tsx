import { TableWorkspaceLoadingState } from "@/components/workspace-loading";

export default function PayoutBatchesLoading() {
  return <TableWorkspaceLoadingState statCount={4} showSecondaryAction={false} />;
}
