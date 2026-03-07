export type WorkspaceShellUser = {
  name: string;
  email: string | null;
  role: string;
  initials: string;
};

export type WorkspaceActivationReminder = {
  completeCount: number;
  totalCount: number;
  isComplete: boolean;
};
