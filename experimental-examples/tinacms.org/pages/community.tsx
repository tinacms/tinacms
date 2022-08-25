import React from 'react'
import styled from 'styled-components'
import { DynamicLink } from 'components/ui/DynamicLink'
import { GetStaticProps } from 'next'
import { FaDiscord, FaTwitter, FaGithub } from 'react-icons/fa'
import TinaIconSvg from '../public/svg/tina-icon.svg'
import {
  Layout,
  Hero,
  Wrapper,
  Section,
  RichTextWrapper,
  MarkdownContent,
} from 'components/layout'
import { Button, ButtonGroup } from 'components/ui'
import { EmailForm } from 'components/forms'
import { NextSeo } from 'next-seo'
import { getJsonPreviewProps } from 'utils/getJsonPreviewProps'

function CommunityPage(props) {
  const data = props.file.data

  return (
    <Layout>
      <NextSeo
        title={data.title}
        description={data.description}
        openGraph={{
          title: data.title,
          description: data.description,
        }}
      />
      <Hero>{data.headline}</Hero>
      <RichTextWrapper>
        <Section>
          <Wrapper>
            <InfoLayout>
              <InfoContent>
                <InfoText>
                  {data.supporting_headline && (
                    <h2>{data.supporting_headline}</h2>
                  )}
                  <hr />
                  <MarkdownContent content={data.supporting_body} />
                </InfoText>
                <ButtonGroup>
                  <DynamicLink
                    href={'https://github.com/tinacms/tinacms/discussions'}
                    passHref
                  >
                    <Button color="white" as="a">
                      <TinaIconSvg
                        // @ts-ignore
                        style={{
                          color: '#EC4815',
                          height: '1.675rem',
                          width: 'auto',
                          margin: '0 0.5rem 0 0.125rem',
                        }}
                      />{' '}
                      Discussion
                    </Button>
                  </DynamicLink>
                  <DynamicLink
                    href={'https://discord.com/invite/zumN63Ybpf'}
                    passHref
                  >
                    <Button color="white" as="a">
                      <FaDiscord
                        style={{
                          color: '#5865f2',
                          height: '1.5rem',
                          width: 'auto',
                          margin: '0 0.5rem 0 0.125rem',
                        }}
                      />{' '}
                      Discord
                    </Button>
                  </DynamicLink>
                  <DynamicLink
                    href={'https://github.com/tinacms/tinacms'}
                    passHref
                  >
                    <Button color="white" as="a">
                      <FaGithub
                        style={{
                          color: '#24292e',
                          height: '1.5rem',
                          width: 'auto',
                          margin: '0 0.5rem 0 0.125rem',
                        }}
                      />{' '}
                      GitHub
                    </Button>
                  </DynamicLink>
                  <DynamicLink href={'https://twitter.com/tina_cms'} passHref>
                    <Button color="white" as="a">
                      <FaTwitter
                        style={{
                          color: '#1DA1F2',
                          height: '1.5rem',
                          width: 'auto',
                          margin: '0 0.5rem 0 0.125rem',
                        }}
                      />{' '}
                      Twitter
                    </Button>
                  </DynamicLink>
                </ButtonGroup>
              </InfoContent>
              <InfoImage src={data.img.src} alt={data.img.alt} />
            </InfoLayout>
          </Wrapper>
        </Section>
        <FormSection color="seafoam">
          <Wrapper>
            {data.newsletter_header && <h2>{data.newsletter_header}</h2>}
            {data.newsletter_cta && <p>{data.newsletter_cta}</p>}
            <EmailForm />
          </Wrapper>
        </FormSection>
      </RichTextWrapper>
    </Layout>
  )
}

export default CommunityPage

/*
 ** DATA FETCHING -----------------------------------------------
 */

export const getStaticProps: GetStaticProps = async function ({
  preview,
  previewData,
}) {
  const { default: metadata } = await import('../content/siteConfig.json')

  const previewProps = await getJsonPreviewProps(
    'content/pages/community.json',
    preview,
    previewData
  )
  return { props: { ...previewProps.props, metadata } }
}
/*
 ** STYLES ------------------------------------------------------
 */

const InfoLayout = styled.div`
  display: grid;
  grid-template-rows: repeat(2, auto);
  grid-template-columns: auto;
  grid-gap: 4rem;
  margin-bottom: 2rem;
  grid-template-areas: 'image' 'content';

  @media (min-width: 1200px) {
    margin-bottom: 4rem;
  }

  @media (min-width: 800px) {
    grid-template-columns: 3fr 2fr;
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
    justify-content: space-between;
  }
`

const InfoText = styled.div`
  margin-bottom: 1.5rem;
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
    flex: 1 0 auto;
  }
`

const InfoImage = styled(({ src, alt, ...styleProps }) => {
  return (
    <div {...styleProps}>
      <img src={src} alt={alt} />
    </div>
  )
})`
  display: block;
  grid-area: image;
  max-width: 65vw;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 0.5rem;
  box-shadow: inset 0 0 0 1px rgba(236, 72, 21, 0.03),
    0 6px 24px rgba(0, 37, 91, 0.05), 0 2px 4px rgba(0, 37, 91, 0.03);

  img {
    display: block;
    margin: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

// @ts-ignore
const FormSection = styled(Section)`
  padding: 4rem 0;

  @media (min-width: 800px) {
    padding: 7rem 0;
    text-align: center;

    form {
      margin: 0 auto;
    }
  }

  p {
    margin-bottom: 2rem;
    font-family: var(--font-tuner);
  }
`
