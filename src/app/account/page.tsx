import { SwitchAccountDialog } from './_components/SwitchAccountDialog'
import { withReadAccess } from '@/modules/account/actions'
import { redirect } from 'next/navigation'
import { UsersSection } from './_components/UsersSection'
import { ExportSection } from './_components/ExportSection'
import { DeleteSection } from './_components/DeleteSection'
import { BillingSection } from './_components/BillingSection'
import { Button } from '@/components/ui/button'
import { Plus, Building2 } from 'lucide-react'
import Link from 'next/link'
import { menu } from '@/lib/menu'

export default async function AccountPage() {
  const auth = await withReadAccess()
  if (auth instanceof Error || !auth.activeAccountId) redirect('/')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Account Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account settings and preferences.</p>
      </div>

      <div className="space-y-10">
        <section>
          <h2 className="text-lg font-medium mb-6">Accounts</h2>
          <div className="space-y-4 flex flex-col gap-2 w-56">
            <SwitchAccountDialog
              trigger={
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Building2 className="mr-2 h-4 w-4" />
                  Switch Active Account
                </Button>
              }
            />
            <Link href={menu.onboarding.href} className="w-full">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Plus className="mr-2 h-4 w-4" />
                Create New Account
              </Button>
            </Link>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-medium mb-6">Billing</h2>
          <BillingSection />
        </section>

        <section>
          <h2 className="text-lg font-medium mb-6">Users & Permissions</h2>
          <UsersSection />
        </section>

        <section>
          <h2 className="text-lg font-medium mb-6">Export Account Data</h2>
          <ExportSection />
        </section>

        <section>
          <h2 className="text-lg font-medium mb-6">Delete Account</h2>
          <DeleteSection />
        </section>
      </div>
    </div>
  )
}
