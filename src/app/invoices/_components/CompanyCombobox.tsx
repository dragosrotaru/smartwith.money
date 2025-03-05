'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { InvoiceCompany } from '@/modules/invoices/model'
import { CompanyForm } from './CompanyForm'

interface CompanyComboboxProps {
  companies: InvoiceCompany[]
  value?: string
  onChange: (value: string) => void
}

export function CompanyCombobox({ companies, value, onChange }: CompanyComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const [localCompanies, setLocalCompanies] = React.useState<InvoiceCompany[]>(companies)

  // Update local companies when props change
  React.useEffect(() => {
    setLocalCompanies(companies)
  }, [companies])

  const filteredCompanies = React.useMemo(() => {
    if (!search) return localCompanies
    const searchLower = search.toLowerCase()
    return localCompanies.filter(
      (company) =>
        company.name.toLowerCase().includes(searchLower) ||
        company.email.toLowerCase().includes(searchLower) ||
        company.contactName.toLowerCase().includes(searchLower),
    )
  }, [localCompanies, search])

  const selectedCompany = React.useMemo(
    () => localCompanies.find((company) => company.id === value),
    [localCompanies, value],
  )

  const handleCompanyCreated = (company: InvoiceCompany) => {
    setLocalCompanies((prev) => [...prev, company])
    onChange(company.id)
    setDialogOpen(false)
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
            {selectedCompany ? selectedCompany.name : 'Select company...'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command shouldFilter={false}>
            <CommandInput placeholder="Search companies..." value={search} onValueChange={setSearch} />
            <CommandList>
              {filteredCompanies.length === 0 ? (
                <CommandEmpty className="py-6 text-center text-sm">
                  <p>No companies found.</p>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => setOpen(false)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create New Company
                    </Button>
                  </DialogTrigger>
                </CommandEmpty>
              ) : (
                <CommandGroup>
                  {filteredCompanies.map((company) => (
                    <CommandItem
                      key={company.id}
                      value={company.name}
                      onSelect={() => {
                        onChange(company.id)
                        setOpen(false)
                      }}
                    >
                      <Check className={cn('mr-2 h-4 w-4', value === company.id ? 'opacity-100' : 'opacity-0')} />
                      <div className="flex flex-col">
                        <div>{company.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {company.contactName} • {company.email}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                  <CommandItem
                    onSelect={() => {
                      setDialogOpen(true)
                      setOpen(false)
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Company
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Company</DialogTitle>
        </DialogHeader>
        <CompanyForm onSuccess={handleCompanyCreated} />
      </DialogContent>
    </Dialog>
  )
}
