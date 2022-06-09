import TinaProvider from "../.tina/components/TinaDynamicProvider";
import React from "react";
import { Iframe } from "tinacms";
import TinaCMS from "tinacms";
import { tinaConfig } from "../.tina/schema.ts";

const Page = () => {
  return (
    <TinaCMS {...tinaConfig}>
      <Iframe />
    </TinaCMS>
  );
};

export default Page;
