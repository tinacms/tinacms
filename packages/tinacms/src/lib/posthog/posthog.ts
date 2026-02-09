// User begins creating branch
export const CreateBranchStartedEvent: string = 'create-branch-started';

// The user finishes creating a branch
export const CreateBranchFinishedEvent: string = 'create-branch-finished';

// When the user switches branches 
export const BranchSwitchedEvent: string = 'branch-switched';

// When a user clicks 'save' in the TinaCMS Editor 
export const SavedContentEvent: string = 'saved-content';

// When a user adds an item to the media manager 
export const MediaManagerContentUploadedEvent: string =
  'media-manager-content-uploaded';

// When a user deletes an item from the media manager 
export const MediaManagerContentDeletedEvent: string =
  'media-manager-content-deleted';

// The format of the content uploaded to the media manager (.webm, .png, etc)
export const MediaManagerContentFormat: string = 
  'media-manager-content-type';

// When a rich-text field is switched to Markdown mode (from Rich-text mode)
export const EditorSwitchedToMarkdownEvent: string =
  'editor-switched-to-markdown';

// When a rich-text field is switched to Rich-text mode (from Markdown mode)
export const EditorSwitchedToRichtextEvent: string =
  'editor-switched-to-richtext';

// When the user navigates to Project Config (TinaCloud) from the TinaCMS editor
export const ProjectConfigNavigatedToFromWebsiteEvent: string = 
  'cloud-navigated-to-from-website';

// When the user navigates to user management (TinaCloud) from the TinaCMS editor
export const UserManagementNavigatedToFromWebsiteEvent: string = 
  'user-management-navigated-to-from-website';
