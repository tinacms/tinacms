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

export const TinaCMSStartedEvent: string = 'tina-cms-started';
export type TinaCMSStartedPayload = {
  version: string;
  system: string;
}

export const CollectionListPageItmeClickedEvent: string = 'collection-list-page-item-clicked';
export type CollectionListPageItmeClickedPayload = {
  itemName: string;
  itemType: 'collection' | 'folder' | 'document';
}
