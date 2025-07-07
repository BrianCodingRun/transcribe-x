import React from 'react'
import { Section } from './Section'

export const Hero = () => {
  return (
    <>
        <Section className="relative flex flex-col justify-center text-center h-[50svh] gap-4">
            <h1 className="text-2xl md:text-5xl font-bold">La simplicité avant tout !</h1>
            <div className="flex flex-col ">
                <p className="text-sm md:text-lg font-light">TranscribeX vous permet de convertir rapidement vos documents, fichiers audio et vidéo. 
                </p>
                <p className="text-sm md:text-lg font-light">Profitez de transcriptions instantanées et précises en toute simplicité. Gagnez du temps avec TranscribeX !</p>
            </div>
        </Section>
    </>
  )
}
