import React from 'react'
import { DynamicLink } from 'components/ui/DynamicLink'
import { FaDiscord, FaTwitter, FaGithub } from 'react-icons/fa'
import TinaIconSvg from '../../public/svg/tina-icon.svg'
import { Button, ButtonGroup } from '../ui'

export const socialTemplate = {
  name: 'social',
  label: 'Social Links',
  ui: {
    defaultItem: {
      tina: 'https://github.com/tinacms/tinacms/discussions',
      discord: 'https://discord.com/invite/zumN63Ybpf',
      github: 'https://github.com/tinacms/tinacms',
      twitter: 'https://twitter.com/tina_cms',
    },
  },
  fields: [
    {
      type: 'string',
      name: 'tina',
      label: 'Tina',
    },
    {
      type: 'string',
      name: 'discord',
      label: 'Discord',
    },
    {
      type: 'string',
      name: 'github',
      label: 'Github',
    },
    {
      type: 'string',
      name: 'twitter',
      label: 'Twitter',
    },
  ],
}

export const SocialBlock = (props) => {
  return (
    <ButtonGroup>
      {props.tina && (
        <DynamicLink href={props.tina} passHref>
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
      )}
      {props.discord && (
        <DynamicLink href={props.discord} passHref>
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
      )}
      {props.github && (
        <DynamicLink href={props.github} passHref>
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
      )}
      {props.twitter && (
        <DynamicLink href={props.twitter} passHref>
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
      )}
    </ButtonGroup>
  )
}
