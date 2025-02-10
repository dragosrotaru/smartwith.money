import Link from 'next/link'
import { menu } from '@/lib/menu'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Filter real estate related tools from the menu
const realEstateTools = Object.values(menu).filter(
  (item) => item.href.startsWith('/real-estate/') && item.href !== '/real-estate',
)

export default function RealEstate() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Real Estate Tools</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {realEstateTools.map((tool) => {
          const Icon = tool.icon
          return (
            <Link key={tool.href} href={tool.href} className="block group">
              <Card className="h-full hover:shadow-xl transition-shadow duration-200">
                <CardHeader className="p-6 text-center">
                  <div className="flex flex-col items-center space-y-4">
                    <Icon className="h-12 w-12 text-muted-foreground group-hover:text-blue-600 transition-colors" />
                    <CardTitle className="text-2xl group-hover:text-blue-600 transition-colors">{tool.title}</CardTitle>
                  </div>
                  <CardDescription className="text-base mt-4">{tool.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
