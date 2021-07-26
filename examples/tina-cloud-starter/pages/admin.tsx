import { useEffect } from "react";
import { useRouter } from "next/router";
import { Container } from "../components/container";
import { Section } from "../components/section";
import { Layout } from "../components/layout";
import { useEditState } from "tinacms/dist/edit-state";

const GoToEditPage: React.FC = () => {
  const { setEdit } = useEditState();
  const router = useRouter();
  useEffect(() => {
    setEdit(true);
    router.back();
  }, []);
  return (
    <Layout>
      <Section className="flex-1">
        <Container size="large prose prose-xl">
          <h2>Going into edit mode...</h2>
        </Container>
      </Section>
    </Layout>
  );
};

export default GoToEditPage;
