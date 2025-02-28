import Link from 'next/link'
import { menu, socialLinks } from '@/lib/menu'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-muted/50 border-t border-border">
      {/* Desktop Footer */}
      <div className="hidden md:block max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground tracking-wider uppercase">Company</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link
                  href={menu.about.href}
                  className="text-base text-muted-foreground hover:text-foreground transition-colors"
                >
                  {menu.about.title}
                </Link>
              </li>
              <li>
                <Link
                  href={menu.contact.href}
                  className="text-base text-muted-foreground hover:text-foreground transition-colors"
                >
                  {menu.contact.title}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link
                  href={menu.privacyPolicy.href}
                  className="text-base text-muted-foreground hover:text-foreground transition-colors"
                >
                  {menu.privacyPolicy.title}
                </Link>
              </li>
              <li>
                <Link
                  href={menu.termsOfService.href}
                  className="text-base text-muted-foreground hover:text-foreground transition-colors"
                >
                  {menu.termsOfService.title}
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground tracking-wider uppercase">Resources</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link
                  href={menu.docs.href}
                  className="text-base text-muted-foreground hover:text-foreground transition-colors"
                >
                  {menu.docs.title}
                </Link>
              </li>
              <li>
                <Link
                  href={menu.blog.href}
                  className="text-base text-muted-foreground hover:text-foreground transition-colors"
                >
                  {menu.blog.title}
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground tracking-wider uppercase">Connect</h3>
            <div className="flex space-x-6 mt-4">
              {Object.entries(socialLinks).map(([key, { href, title, icon: Icon }]) => (
                <a
                  key={key}
                  href={href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sr-only">{title}</span>
                  <Icon className="h-6 w-6" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-base text-muted-foreground text-center">
            © {currentYear} Rotaru & Co Inc. All rights reserved.
          </p>
        </div>
      </div>

      {/* Mobile Footer */}
      <div className="md:hidden px-4 py-6">
        {/* Social Links */}
        <div className="flex justify-center space-x-6 mb-6">
          {Object.entries(socialLinks).map(([key, { href, title, icon: Icon }]) => (
            <a
              key={key}
              href={href}
              className="text-muted-foreground hover:text-foreground transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="sr-only">{title}</span>
              <Icon className="h-6 w-6" />
            </a>
          ))}
        </div>

        {/* Important Links */}
        <div className="flex justify-center space-x-4 text-sm text-muted-foreground">
          <Link href={menu.about.href} className="hover:text-foreground transition-colors">
            {menu.about.title}
          </Link>
          <span className="text-border">·</span>
          <Link href={menu.privacyPolicy.href} className="hover:text-foreground transition-colors">
            {menu.privacyPolicy.title}
          </Link>
          <span className="text-border">·</span>
          <Link href={menu.termsOfService.href} className="hover:text-foreground transition-colors">
            {menu.termsOfService.title}
          </Link>
        </div>

        {/* Copyright */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">© {currentYear} Rotaru & Co Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
