import React from "react";
import TinaCMS, { TinaAdmin } from "tinacms";
import { TinaEditProvider, setEditing } from "tinacms/dist/edit-state";

function App() {
  setEditing(true);

  return (
    <TinaEditProvider
      editMode={
        <TinaCMS
        // populate a .env file with VITE_CLIENT_URL=***
        // clientId={process.env.VITE_CLIENT_URL}
        // in production this would be changed to isLocalClient={false}
        // isLocalClient={true}
        >
          <TinaAdmin />
        </TinaCMS>
      }
    >
      <div>Need to be in edit mode!</div>
    </TinaEditProvider>
  );
}

export default App;
