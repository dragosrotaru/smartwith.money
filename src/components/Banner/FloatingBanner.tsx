'use client'

import { Banner, BannerProps } from './Banner'
import { AnimatePresence, motion } from 'framer-motion'

export function FloatingBanner(props: BannerProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="fixed bottom-4 right-4 z-50 max-w-md"
      >
        <Banner {...props} />
      </motion.div>
    </AnimatePresence>
  )
}
