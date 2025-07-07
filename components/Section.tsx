import { cn } from '@/lib/utils'
import React from 'react'

export const Section = (props: React.PropsWithChildren<{className?: string}>) => {
  return (
    <section className={cn('max-w-full md:max-w-5xl w-full md:w-4/5 px-4 m-auto', props.className)}>
        {props.children}
    </section>
  )
}
