import React from 'react'
import { Button } from '@toolkit/styles'
import { BiLeftArrowAlt, BiRightArrowAlt } from 'react-icons/bi'

export interface MediaPaginatorProps {
  navigateNext: () => void
  navigatePrev: () => void
  hasNext: boolean
  hasPrev: boolean
  variant?: 'primary' | 'secondary' | 'white' | 'ghost'
}

export function CursorPaginator({
  navigateNext,
  navigatePrev,
  hasNext,
  hasPrev,
  variant = 'white',
}: MediaPaginatorProps) {
  return (
    <div className="w-full flex flex-shrink-0 justify-end gap-2 items-center">
      <Button variant={variant} disabled={!hasPrev} onClick={navigatePrev}>
        <BiLeftArrowAlt className="w-6 h-full mr-2 opacity-70" /> Previous
      </Button>
      <Button variant={variant} disabled={!hasNext} onClick={navigateNext}>
        Next <BiRightArrowAlt className="w-6 h-full ml-2 opacity-70" />
      </Button>
    </div>
  )
}
