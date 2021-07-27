import Link from "next/link";
import { Layout } from "../components/layout";

export default function FourOhFour() {
  return (
    <Layout>
      <h2>OOPS, NOTHING TO SEE HERE...</h2>
      <Link href="/">Go back home</Link>
    </Layout>
  );
}
