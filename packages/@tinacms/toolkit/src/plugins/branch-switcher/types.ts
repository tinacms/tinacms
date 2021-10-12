/**
Copyright 2021 Forestry.io Holdings, Inc.
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import { TinaCMS } from '../../tina-cms'

export interface Branch {
  name: string
}

export interface BranchSwitcherProps {
  currentBranch: string
  setCurrentBranch: (branchName: string) => void
  listBranches: () => Promise<Branch[]>
  createBranch: (branchName: string) => Promise<string>
}

export interface BranchSwitcherPluginOptions extends BranchSwitcherProps {
  owner: string,
  repo: string,
  baseBranch: string
  cms: TinaCMS
}

export interface BranchChangeEvent {
  type: 'branch-switcher:change-branch'
  branchName: string
}

export interface BranchData {
  owner: string,
  repo: string,
  baseBranch?: string,
  branchName?: string
}
