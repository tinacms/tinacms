import { ScreenPlugin, useCMS } from "tinacms";
import { useCallback } from "react";

const branches = ["main", "cloud-branch-switcher", "dwalkr-patch-1"];

const BranchSwitcherComponent = () => {
  const cms = useCMS();
  const changeBranch = useCallback((branch) => {
    //console.log(`switching branch to ${branch}`);
    cms.events.dispatch({
      type: "content-source-change",
      branch,
    });
  }, []);
  return (
    <div
      style={{
        display: "flex",
        flexFlow: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h3>Select Branch</h3>
      <select
        onChange={(e) => {
          changeBranch(e.target.value);
        }}
      >
        {branches.map((branch) => (
          <option value={branch}>{branch}</option>
        ))}
      </select>
    </div>
  );
};

export const BranchSwitcherPlugin: ScreenPlugin = {
  __type: "screen",
  name: "Branch Selector",
  Icon: () => <span>∆</span>,
  Component: BranchSwitcherComponent,
  layout: "popup",
};
