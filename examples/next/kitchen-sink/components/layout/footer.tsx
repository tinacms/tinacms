'use client'

import React from 'react'
import Link from 'next/link'
import { FaFacebookF, FaGithub, FaTwitter } from 'react-icons/fa'
import { AiFillInstagram } from 'react-icons/ai'
import { useLayout } from './layout-context'
import { Container } from './container'
import { Icon } from './icon'

export const Footer = () => {
  const { globalSettings, theme } = useLayout()

  const footer = globalSettings?.footer
  const header = globalSettings?.header
  const socialIconClasses = 'h-7 w-auto'

  const socialIconColorClasses: Record<string, string> = {
    blue: 'text-blue-500 dark:text-blue-400 hover:text-blue-300',
    teal: 'text-teal-500 dark:text-teal-400 hover:text-teal-300',
    green: 'text-green-500 dark:text-green-400 hover:text-green-300',
    red: 'text-red-500 dark:text-red-400 hover:text-red-300',
    pink: 'text-pink-500 dark:text-pink-400 hover:text-pink-300',
    purple: 'text-purple-500 dark:text-purple-400 hover:text-purple-300',
    orange: 'text-orange-500 dark:text-orange-400 hover:text-orange-300',
    yellow: 'text-yellow-500 dark:text-yellow-400 hover:text-yellow-300',
  }

  const iconColorClass = socialIconColorClasses[theme.color] || socialIconColorClasses.blue

  const socialIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    github: FaGithub,
    twitter: FaTwitter,
    facebook: FaFacebookF,
    instagram: AiFillInstagram,
  }

  return (
    <footer className="bg-gradient-to-br text-gray-800 from-white to-gray-50 dark:from-gray-900 dark:to-gray-1000">
      <Container className="relative" size="small">
        <div className="flex justify-between items-center gap-6 flex-wrap">
          <Link
            href="/"
            className="group mx-2 flex items-center font-bold tracking-tight text-gray-400 dark:text-gray-300 opacity-50 hover:opacity-100 transition duration-150 ease-out whitespace-nowrap"
          >
            <Icon
              parentColor="default"
              data={{
                name: 'Tina',
                color: theme.color,
                style: 'float',
              }}
              className="inline-block h-10 w-auto group-hover:text-orange-500"
            />
          </Link>
          <div className="flex gap-4">
            {footer?.social?.map((social: any, index: number) => {
              const SocialIcon = socialIconMap[social.icon?.toLowerCase() || '']
              if (!SocialIcon || !social.url) return null
              return (
                <a
                  key={index}
                  className="inline-block opacity-80 hover:opacity-100 transition ease-out duration-150"
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SocialIcon className={`${socialIconClasses} ${iconColorClass}`} />
                </a>
              )
            })}
          </div>
        </div>
        <div className="absolute h-1 bg-gradient-to-r from-transparent via-black dark:via-white to-transparent top-0 left-4 right-4 opacity-5" />
      </Container>
    </footer>
  )
}
