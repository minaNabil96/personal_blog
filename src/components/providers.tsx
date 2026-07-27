'use client'

import { useEffect, type ReactNode } from 'react'
import { domAnimation, LazyMotion } from 'framer-motion'
import { ToastProvider as CustomToastProvider } from '@/components/ui/toast'
import AOS from 'aos'
import 'aos/dist/aos.css'

export default function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
    })
  }, [])

  return (
    <LazyMotion features={domAnimation}>
      <CustomToastProvider>
        {children}
      </CustomToastProvider>
    </LazyMotion>
  )
}
