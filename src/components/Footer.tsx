import Link from 'next/link'
import { menu, socialLinks } from '@/lib/menu'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700/50">
      {/* Desktop Footer */}
      <div className="hidden md:block max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 tracking-wider uppercase">Company</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link
                  href={menu.about.href}
                  className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  {menu.about.title}
                </Link>
              </li>
              <li>
                <Link
                  href={menu.contact.href}
                  className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  {menu.contact.title}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link
                  href={menu.privacyPolicy.href}
                  className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  {menu.privacyPolicy.title}
                </Link>
              </li>
              <li>
                <Link
                  href={menu.termsOfService.href}
                  className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  {menu.termsOfService.title}
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 tracking-wider uppercase">
              Resources
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link
                  href={menu.docs.href}
                  className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  {menu.docs.title}
                </Link>
              </li>
              <li>
                <Link
                  href={menu.blog.href}
                  className="text-base text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  {menu.blog.title}
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 tracking-wider uppercase">Connect</h3>
            <div className="flex space-x-6 mt-4">
              {Object.entries(socialLinks).map(([key, { href, title, icon: Icon }]) => (
                <a
                  key={key}
                  href={href}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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

        <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700/50">
          <p className="text-base text-gray-400 dark:text-gray-500 text-center">
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
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="sr-only">{title}</span>
              <Icon className="h-6 w-6" />
            </a>
          ))}
        </div>

        {/* Important Links */}
        <div className="flex justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
          <Link href={menu.about.href} className="hover:text-gray-700 dark:hover:text-gray-200">
            {menu.about.title}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">·</span>
          <Link href={menu.privacyPolicy.href} className="hover:text-gray-700 dark:hover:text-gray-200">
            {menu.privacyPolicy.title}
          </Link>
          <span className="text-gray-300 dark:text-gray-600">·</span>
          <Link href={menu.termsOfService.href} className="hover:text-gray-700 dark:hover:text-gray-200">
            {menu.termsOfService.title}
          </Link>
        </div>

        {/* Copyright */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            © {currentYear} Rotaru & Co Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
