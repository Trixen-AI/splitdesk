import { Follow } from '@/components/sections/Follow'
import { Hero } from '@/components/sections/Hero'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { Idea } from '@/components/sections/Idea'
import { Notes } from '@/components/sections/Notes'
import { Promise } from '@/components/sections/Promise'
import { Split } from '@/components/sections/Split'
import { Why } from '@/components/sections/Why'
import { useSeo } from '@/lib/seo'

export default function Home() {
  useSeo({ path: '/' })
  return (
    <>
      <Hero />
      <Idea />
      <Split />
      <Why />
      <HowItWorks />
      <Promise />
      <Notes />
      <Follow />
    </>
  )
}
