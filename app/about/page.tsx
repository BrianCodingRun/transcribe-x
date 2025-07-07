import { Header } from '@/components/Header'
import React from 'react'

export default function About() {
  return (
    <main>
        {/* HEADER */}
        <Header />
        <div className='h-[100vh] flex items-center justify-center'>
            <h1 className='text-6xl'>About Page</h1>
        </div>
    </main>
  )
}
