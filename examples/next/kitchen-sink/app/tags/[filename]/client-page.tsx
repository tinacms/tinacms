'use client';
import { useTina } from 'tinacms/dist/react';
import type { TinaPageProps } from '@/lib/types';
import { Section } from '@/components/layout/section';
import { Container } from '@/components/layout/container';
import { GradientTitle } from '@/components/ui/gradient-title';
import { NoData } from '@/components/ui/no-data';

export default function TagClientPage(props: TinaPageProps) {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  });

  if (data?.tag) {
    return (
      <Section className='flex-1'>
        <Container width='small' size='large'>
          <GradientTitle size='5xl'>
            {data.tag.name || data.tag.title}
          </GradientTitle>
        </Container>
      </Section>
    );
  }

  return <NoData />;
}
