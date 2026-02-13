// User begins creating branch
export const CreateBranchEvent: string = 'create-branch';
export type CreateBranchPayload = {
  branchName: string;
  status: 'indexed' | 'unindexed';
};

// The user finishes creating a branch
export const CreatePullRequestEvent: string = 'create-pull-request';
export type CreatePullRequestPayload = {
  pullRequestUrl: string;
  branchName: string;
  createdAt: string;
};

export const FinishPullRequestEvent: string = 'finish-pull-request';
export type FinishPullRequestPayload = {
  pullRequestUrl: string;
  branchName: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: string;
};

// When the user switches branches
export const BranchSwitchedEvent: string = 'branch-switched';
export type BranchSwitchedPayload = {
  branchName: string;
};

// When a user clicks 'save' in the TinaCMS Editor
export const SavedContentEvent: string = 'saved-content';
export type SavedContentPayload = {
  collection?: string;
  documentPath?: string;
};

// When a user adds an item to the media manager
export const MediaManagerContentUploadedEvent: string =
  'media-manager-content-uploaded';
export type MediaManagerContentUploadedPayload = Record<string, never>;

// When a user deletes an item from the media manager
export const MediaManagerContentDeletedEvent: string =
  'media-manager-content-deleted';
export type MediaManagerContentDeletedPayload = Record<string, never>;

// Switching between raw and rich-text editor modes
export const RichTextEditorSwitchedEvent: string = 'rich-text-editor-switched';
export type RichTextEditorSwitchedPayload = {
  to: 'markdown' | 'richtext';
};

// When the user navigates to Project Config (TinaCloud) from the TinaCMS editor
export const ProjectConfigNavigatedToFromWebsiteEvent: string =
  'cloud-navigated-to-from-website';
export type ProjectConfigNavigatedToFromWebsitePayload = Record<string, never>;

// When the user navigates to user management (TinaCloud) from the TinaCMS editor
export const UserManagementNavigatedToFromWebsiteEvent: string =
  'user-management-navigated-to-from-website';
export type UserManagementNavigatedToFromWebsitePayload = Record<string, never>;
