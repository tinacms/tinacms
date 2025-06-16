import client from "@/tina/__generated__/client";
import TestClientPage from "./client-page";

export async function generateStaticParams() {
  const pages = await client.queries.testConnection();
  const paths = pages.data?.testConnection?.edges?.map((edge) => ({
    filename: edge?.node?._sys.breadcrumbs,
  }));

  return paths || [];
}

export default async function PostPage({
  params,
}: {
  params: { filename: string[] };
}) {
  const data = await client.queries.test({
    relativePath: `${params.filename}.json`,
  });

  return <TestClientPage {...data} />;
}
