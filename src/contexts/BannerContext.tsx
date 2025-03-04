'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import { HeaderBanner, FloatingBanner, BannerProps } from '@/components/Banner'

type BannerType = 'header' | 'floating'

interface BannerContextType {
  showBanner: (type: BannerType, props: Omit<BannerProps, 'onDismiss'>) => string
  dismissBanner: (id: string) => void
}

const BannerContext = createContext<BannerContextType | null>(null)

export function useBanner() {
  const context = useContext(BannerContext)
  if (!context) {
    throw new Error('useBanner must be used within a BannerProvider')
  }
  return context
}

export function BannerProvider({ children }: { children: React.ReactNode }) {
  const [banners, setBanners] = useState<Array<BannerProps & { type: BannerType }>>([])

  const showBanner = useCallback((type: BannerType, props: Omit<BannerProps, 'onDismiss'>) => {
    setBanners((prev) => [...prev, { ...props, type }])
    return props.id
  }, [])

  const dismissBanner = useCallback((id: string) => {
    setBanners((prev) => prev.filter((banner) => banner.id !== id))
  }, [])

  return (
    <BannerContext.Provider value={{ showBanner, dismissBanner }}>
      {children}
      {banners.map((banner) => {
        const { type, ...bannerProps } = banner
        const props = {
          ...bannerProps,
          onDismiss: () => dismissBanner(banner.id),
        }

        return type === 'header' ? (
          <HeaderBanner key={banner.id} {...props} />
        ) : (
          <FloatingBanner key={banner.id} {...props} />
        )
      })}
    </BannerContext.Provider>
  )
}
