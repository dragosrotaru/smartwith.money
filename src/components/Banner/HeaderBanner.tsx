'use client'

import { Banner, BannerProps } from './Banner'
import { AnimatePresence, motion } from 'framer-motion'

export function HeaderBanner(props: BannerProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={props.id}
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed top-16 left-0 right-0 z-40 h-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <Banner {...props} className="h-10" />
      </motion.div>
    </AnimatePresence>
  )
}
