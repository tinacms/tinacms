import { ScreenPlugin, useCMS } from "tinacms";
import { useCallback, useState, useEffect } from "react";

export interface NewBranch {
  owner: string,
  repo: string,
  baseBranch: string,
  name: string
}
const owner = process.env.NEXT_PUBLIC_GITHUB_NAME
const repo = process.env.NEXT_PUBLIC_GITHUB_REPO

async function createBranch(url: string, data: NewBranch) {
  const response = fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  return (await response).json()
}
const BranchSwitcherComponent = ({
  initialBranch,
}: {
  initialBranch: string;
}) => {
  const [currentBranch, setCurrentBranch] = useState(initialBranch);
  const [branchList, setBranchList] = useState([]);
  const [newBranch, setNewBranch] = useState('')
  const cms = useCMS();
  const changeBranch = useCallback((branch) => {
    //console.log(`switching branch to ${branch}`);
    cms.events.dispatch({
      type: "content-source-change",
      branch,
    });
  }, []);
  const handleCreateBranch = useCallback((value) => {
    createBranch('http://localhost:4001/create-branch', {
      owner,
      repo,
      baseBranch: currentBranch,
      name: value
    })
    setCurrentBranch(value)
    cms.events.dispatch({
      type: "content-source-change",
      currentBranch,
    });
  }, [])

  useEffect(() => {
    console.log('hello there')
    fetch(`http://localhost:4001/list-branches?owner=${owner}&repo=${repo}`)
    .then(response => response.json())
    .then(data => {
      setBranchList(data)
    })
  }, [])

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
        {branchList.map((branch) => {
          return (
            <option
              key={branch.name}
              value={branch.name}
              selected={branch.name === currentBranch}
            >
              {branch.name}
            </option>
          )
        })}
      </select>
      <div style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flext-start",
        width: "inherit",
        marginTop: "2rem"
      }}>
        <label>Create Branch</label>
        <input 
          placeholder='branch name'
          onChange={(e) => {
            setNewBranch(e.target.value)
          }}
        />
        <button
          onClick={(e) => {
            e.preventDefault()
            console.log('clicked')
            handleCreateBranch(newBranch)
          }}
          style={{
            border: "1px solid black",
            margin: "10px 0px",
            padding: "5px"
          }}
        >
          Create
        </button>
      </div>
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
