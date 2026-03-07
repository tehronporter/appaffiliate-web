import { TableWorkspaceLoadingState } from "@/components/workspace-loading";

export default function CommissionsLoading() {
  return <TableWorkspaceLoadingState statCount={5} showSecondaryAction={false} />;
}
