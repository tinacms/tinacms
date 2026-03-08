// When the user switches branches
export const BranchSwitchedEvent: string = 'branch-switched';
export type BranchSwitchedPayload = {
  branchSwitchedTo: string;
};

export const BranchSwitcherOpenedEvent: string = 'branch-switcher-opened';
export type BranchSwitcherOpenedPayload = Record<string, never>;

export const BranchSwitcherSearchEvent: string = 'branch-switcher-search';
export type BranchSwitcherSearchPayload = {
  option: string;
};

export const BranchSwitcherDropDownEvent: string = 'branch-switcher-dropdown';
export type BranchSwitcherDropDownPayload = Record<string, never>;

export const BranchSwitcherPRClickedEvent: string =
  'branch-switcher-pr-clicked';
export type BranchSwitcherPRClickedPayload = {
  type: 'Open Git Pull Request' | 'Create PR';
};

// When a user successfully saves content in the TinaCMS Editor
export const SavedContentEvent: string = 'saved-content';
export type SavedContentPayload = {
  collection?: string;
  documentPath?: string;
};

// When a save fails in the TinaCMS Editor
export const SaveContentErrorEvent: string = 'save-content-error';
export type SaveContentErrorPayload = {
  collection?: string;
  documentPath?: string;
  error?: string;
};

// When a user resets a form in the TinaCMS Editor  
export const FormResetEvent: string = 'form-reset';

// When a user adds an item to the media manager
export const MediaManagerContentUploadedEvent: string =
  'media-manager-content-uploaded';
export type MediaManagerContentUploadedPayload = {
  fileType: string;
  fileCount: number;
};

// When a user deletes an item from the media manager
export const MediaManagerContentDeletedEvent: string =
  'media-manager-content-deleted';
export type MediaManagerContentDeletedPayload = {
  fileType: string;
};

// Switching between raw and rich-text editor modes
export const RichTextEditorSwitchedEvent: string = 'rich-text-editor-switched';
export type RichTextEditorSwitchedPayload = {
  to: 'markdown' | 'richtext';
};

export const EventLogPageViewedEvent: string = 'event-log-page-viewed';

// When the user navigates to Project Config (TinaCloud) from the TinaCMS editor
export const ProjectConfigNavigatedToFromWebsiteEvent: string =
  'cloud-navigated-to-from-website';
export type ProjectConfigNavigatedToFromWebsitePayload = Record<string, never>;

// When the user navigates to user management (TinaCloud) from the TinaCMS editor
export const UserManagementNavigatedToFromWebsiteEvent: string =
  'user-management-navigated-to-from-website';
export type UserManagementNavigatedToFromWebsitePayload = Record<string, never>;

export const TinaCMSStartedEvent: string = 'tina-cms-started';
export type TinaCMSStartedPayload = {
  tinaCMSVersion: string;
  system: string;
};

export const CollectionListPageItemClickedEvent: string =
  'collection-list-page-item-clicked';
export type CollectionListPageItemClickedPayload = {
  itemName: string;
  itemType: 'folder' | 'document';
  collectionName: string;
};

export const CollectionListPageSortEvent: string = 'collection-list-page-sort';
export type CollectionListPageSortPayload = {
  sortKey: string;
  collectionName: string;
};

export const CollectionListPageSearchEvent: string =
  'collection-list-page-search';
export type CollectionListPageSearchPayload = {
  searchQuery: string;
};

export const CloudConfigNavComponentClickedEvent: string =
  'cloud-config-nav-component-clicked';
export type CloudConfigNavComponentClickedPayload = {
  itemType: 'Project Config' | 'User Management' | 'Support';
};
