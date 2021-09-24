import { ScreenPlugin, useCMS } from "tinacms";
import { useCallback, useState, useEffect } from "react";

export interface NewBranch {
  auth: string;
  owner: string;
  repo: string;
  baseBranch: string;
  name: string;
}
const owner = process.env.NEXT_PUBLIC_GITHUB_NAME;
const repo = process.env.NEXT_PUBLIC_GITHUB_REPO;
const auth = process.env.NEXT_PUBLIC_GITHUB_PERSONAL_ACCESS_TOKEN;

async function createBranch(url: string, data: NewBranch) {
  const response = fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return (await response).json();
}
const BranchSwitcherComponent = ({
  initialBranch,
}: {
  initialBranch: string;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentBranch, setCurrentBranch] = useState(initialBranch);
  const [branchList, setBranchList] = useState([]);
  const cms = useCMS();
  const handleCreateBranch = useCallback((value) => {
    setIsLoading(true);
    createBranch("http://localhost:4001/create-branch", {
      auth,
      owner,
      repo,
      baseBranch: currentBranch ?? "main",
      name: value,
    })
      .then(async (data) => {
        setCurrentBranch(value);
        cms.events.dispatch({
          type: "content-source-change",
          currentBranch: value,
        });
        await refreshBranchList();
      })
      .finally(() => setIsLoading(false));
  }, []);

  const refreshBranchList = useCallback(async () => {
    setIsLoading(true);
    await fetch(
      `http://localhost:4001/list-branches?auth=${auth}&owner=${owner}&repo=${repo}`
    )
      .then((response) => response.json())
      .then((data) => {
        setBranchList(data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // load branch list
  useEffect(() => {
    refreshBranchList();
  }, []);

  useEffect(() => {
    cms.events.dispatch({
      type: "content-source-change",
      branch: currentBranch,
    });
  }, [currentBranch]);

  return (
    <div
      style={{
        display: "flex",
        flexFlow: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: isLoading ? 0.5 : 1,
        pointerEvents: isLoading ? "none" : "initial",
      }}
    >
      <h3>Select Branch</h3>
      <BranchSelector
        currentBranch={currentBranch}
        branchList={branchList}
        onCreateBranch={(newBranch) => {
          handleCreateBranch(newBranch);
        }}
        onChange={(branchName) => {
          setCurrentBranch(branchName);
        }}
      />
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

const BranchSelector = ({
  branchList,
  currentBranch,
  onCreateBranch,
  onChange,
}) => {
  const [newBranch, setNewBranch] = useState("");
  const branchExists = branchList.find((branch) => branch.name === newBranch);
  return (
    <div
      style={{
        width: "100%",
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "center",
      }}
    >
      <input value={newBranch} onChange={(e) => setNewBranch(e.target.value)} />
      <hr />
      {!branchExists && newBranch ? (
        <div
          style={{ cursor: "pointer" }}
          onMouseOver={(e: any) =>
            (e.target.style.backgroundColor = "aquamarine")
          }
          onMouseOut={(e: any) => {
            e.target.style.backgroundColor = "transparent";
          }}
          onClick={() => {
            onCreateBranch(newBranch);
          }}
        >
          Create New Branch `{newBranch}`...
        </div>
      ) : (
        ""
      )}
      <hr />
      <div
        style={{
          border: "1px solid magenta",
          maxHeight: "70vh",
          overflowY: "auto",
        }}
      >
        {branchList
          .filter((branch) => !newBranch || branch.name.includes(newBranch))
          .map((branch) => {
            return (
              <div
                style={{ cursor: "pointer" }}
                onMouseOver={(e: any) =>
                  (e.target.style.backgroundColor = "aquamarine")
                }
                onMouseOut={(e: any) => {
                  e.target.style.backgroundColor = "transparent";
                }}
                key={branch.name}
                onClick={() => onChange(branch.name)}
              >
                {branch.name}
                {branch.name === currentBranch && (
                  <span style={{ fontStyle: "italic", opacity: 0.5 }}>
                    (Current)
                  </span>
                )}
              </div>
            );
          })}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flext-start",
          width: "inherit",
          marginTop: "2rem",
        }}
      ></div>
    </div>
  );
};
