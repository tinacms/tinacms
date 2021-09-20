import { ScreenPlugin, useCMS } from "tinacms";
import { useCallback, useState } from "react";

const branches = ["main", "cloud-branch-switcher", "dwalkr-patch-1"];

const BranchSwitcherComponent = ({
  initialBranch,
}: {
  initialBranch: string;
}) => {
  const [currentBranch, setCurrentBranch] = useState(initialBranch);
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
          setCurrentBranch(e.target.value);
          changeBranch(e.target.value);
        }}
      >
        {branches.map((branch) => (
          <option
            key={branch}
            value={branch}
            selected={branch === currentBranch}
          >
            {branch}
          </option>
        ))}
      </select>
    </div>
  );
};

export class BranchSwitcherPlugin implements ScreenPlugin {
  __type = "screen" as "screen";
  name = "Branch Selector";
  Icon = () => <span>∆</span>;
  Component = () => (
    <BranchSwitcherComponent initialBranch={this.initialBranch} />
  );
  layout: "popup";

  constructor(private initialBranch: string) {}
}
