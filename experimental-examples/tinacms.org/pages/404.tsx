import React from 'react'
import styled from 'styled-components'
import {
  Layout,
  Hero,
  Wrapper,
  Section,
  RichTextWrapper,
} from 'components/layout'
import { NextSeo } from 'next-seo'
import { Button, ButtonGroup } from 'components/ui'
import { DynamicLink } from 'components/ui/DynamicLink'

function Page404() {
  return (
    <Layout>
      <NextSeo title={'404'} description={'404'} />
      <Hero>404 </Hero>
      <RichTextWrapper>
        <Section>
          <Wrapper>
            <InfoLayout>
              <InfoContent>
                <InfoText>
                  <h2>Sorry, Friend.</h2>
                  <hr />
                  <p>We couldn't find what you were looking for.</p>
                </InfoText>
                <ButtonGroup>
                  <DynamicLink href={'/docs'} passHref>
                    <Button as="a">Documentation</Button>
                  </DynamicLink>
                  <DynamicLink href={'/guides'} passHref>
                    <Button as="a">Guides</Button>
                  </DynamicLink>
                  <DynamicLink href={'/'} passHref>
                    <Button as="a">Home</Button>
                  </DynamicLink>
                </ButtonGroup>
              </InfoContent>
              <InfoImage src="/img/rico-replacement.jpg" />
            </InfoLayout>
          </Wrapper>
        </Section>
      </RichTextWrapper>
    </Layout>
  )
}

export const getStaticProps = async function ({ preview, previewData }) {
  return { props: {} }
}

export default Page404

/*
 ** STYLES ------------------------------------------------------
 */

const InfoLayout = styled.div`
  display: grid;
  grid-template-rows: repeat(2, auto);
  grid-template-columns: auto;
  grid-gap: 2rem;
  grid-template-areas: 'image' 'content';

  @media (min-width: 1200px) {
    margin-bottom: 4rem;
  }

  @media (min-width: 800px) {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: auto;
    align-items: stretch;
    grid-template-areas: 'content image';
  }
`

const InfoContent = styled.div`
  grid-area: content;
  @media (min-width: 800px) {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
`

const InfoText = styled.div`
  margin-bottom: 1.75rem;
  h1,
  h2,
  h3,
  .h1,
  .h2,
  .h3 {
    text-align: center;
  }
  hr {
    margin-left: auto;
    margin-right: auto;
  }
  @media (min-width: 800px) {
    h1,
    h2,
    h3,
    .h1,
    .h2,
    .h3 {
      text-align: left;
    }
    hr {
      margin-left: 0;
      margin-right: 0;
    }
  }
`

const InfoImage = styled(({ src, ...styleProps }) => {
  return (
    <div {...styleProps}>
      <img src={src} alt="" />
    </div>
  )
})`
  display: block;
  grid-area: image;
  max-width: 65vw;
  margin: 0 auto;
  border-radius: 2rem;
  overflow: hidden;
  max-height: 25rem;

  img {
    display: block;
    margin: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`
