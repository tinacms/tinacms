import TinaCMS from "tinacms";
import { tinaConfig } from "../.tina/schema.ts";

export default function Page() {
  return <TinaCMS {...tinaConfig} />;
}
