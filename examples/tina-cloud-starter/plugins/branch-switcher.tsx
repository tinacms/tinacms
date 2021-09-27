import { ScreenPlugin, useCMS } from "tinacms";
import { useCallback, useState, useEffect } from "react";

export interface NewBranch {
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
      `http://localhost:4001/list-branches?owner=${owner}&repo=${repo}`
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

const PullRequestIcon = () => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.6328 19.163V11.997C22.6281 10.391 21.613 8 18.8359 8V6L15.0484 9L18.8359 12V10C20.5677 10 20.7306 11.539 20.7391 12V19.163C19.3756 19.597 18.3719 20.92 18.3719 22.5C18.3719 24.43 19.8585 26 21.686 26C23.5134 26 25 24.43 25 22.5C25 20.92 23.9963 19.597 22.6328 19.163ZM21.686 24C20.9029 24 20.2656 23.327 20.2656 22.5C20.2656 21.673 20.9029 21 21.686 21C22.469 21 23.1063 21.673 23.1063 22.5C23.1063 23.327 22.469 24 21.686 24ZM13.6281 9.5C13.6281 7.57 12.1415 6 10.314 6C8.48659 6 7 7.57 7 9.5C7 11.08 8.00368 12.403 9.36718 12.837V19.163C8.00368 19.597 7 20.92 7 22.5C7 24.43 8.48659 26 10.314 26C12.1415 26 13.6281 24.43 13.6281 22.5C13.6281 20.92 12.6244 19.597 11.2609 19.163V12.837C12.6244 12.403 13.6281 11.08 13.6281 9.5ZM8.89374 9.5C8.89374 8.673 9.53098 8 10.314 8C11.0971 8 11.7344 8.673 11.7344 9.5C11.7344 10.327 11.0971 11 10.314 11C9.53098 11 8.89374 10.327 8.89374 9.5ZM11.7344 22.5C11.7344 23.327 11.0971 24 10.314 24C9.53098 24 8.89374 23.327 8.89374 22.5C8.89374 21.673 9.53098 21 10.314 21C11.0971 21 11.7344 21.673 11.7344 22.5Z"
      fill="inherit"
    />
  </svg>
);

export class BranchSwitcherPlugin implements ScreenPlugin {
  __type = "screen" as "screen";
  name = "Branch Selector";
  Icon = PullRequestIcon;
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
