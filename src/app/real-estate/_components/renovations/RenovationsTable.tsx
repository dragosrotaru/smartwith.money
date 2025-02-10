'use client'
import { type Renovation as Reno } from '@/modules/house/photo'
import * as React from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  RowSelectionState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowUpDown, ChevronDown, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

type Renovation = Reno & {
  type: string
}

export const columns: ColumnDef<Renovation>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <div className="flex justify-center mx-4">
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex justify-center mx-4">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className=""
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => <div className="capitalize">{row.getValue('title')}</div>,
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => (
      <div className="capitalize max-w-96 text-wrap text-sm h-20 overflow-hidden">{row.getValue('description')}</div>
    ),
  },
  {
    accessorKey: 'difficulty',
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Difficulty
          <ArrowUpDown />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Badge className="text-center align-middle justify-center">{row.getValue('difficulty')}</Badge>
      </div>
    ),
  },
  {
    accessorKey: 'diyTime',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        DIY Time
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => {
      const diyTime = parseFloat(row.getValue('diyTime'))
      return <div className="text-center">{diyTime} hours</div>
    },
  },
  {
    accessorKey: 'materialCost',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Material Cost
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => {
      const materialCost = parseFloat(row.getValue('materialCost'))
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'CAD',
      }).format(materialCost)
      return <div className="text-center">{formatted}</div>
    },
  },
  {
    accessorKey: 'laborCost',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Labor Cost
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => {
      const laborCost = parseFloat(row.getValue('laborCost'))
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'CAD',
      }).format(laborCost)
      return <div className="text-center">{formatted}</div>
    },
  },
  {
    accessorKey: 'priorityScore',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Priority Score
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => {
      const priorityScore = parseFloat(row.getValue('priorityScore'))
      return <div className="text-center">{priorityScore}%</div>
    },
  },
  {
    accessorKey: 'roi',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        ROI
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => {
      const roi = parseFloat(row.getValue('roi'))

      return <div className="text-center font-medium">{roi}%</div>
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const renovation = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(renovation.title)}>
              Copy renovation title
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View renovation details</DropdownMenuItem>
            <DropdownMenuItem>View renovation details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export function RenovationTable({
  renovations,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  selectedRenovations,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSelected,
}: {
  renovations: Renovation[]
  selectedRenovations: Renovation[]
  onSelected: (renovations: Renovation[]) => void
}) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})

  /*   // Initialize rowSelection based on selectedRenovations
  const initialRowSelection = React.useMemo(() => {
    return selectedRenovations.reduce((acc, renovation) => {
      const index = renovations.findIndex((r) => r.title === renovation.title)
      if (index >= 0) {
        acc[index] = true
      }
      return acc
    }, {} as RowSelectionState)
  }, [selectedRenovations, renovations]) */

  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})

  const table = useReactTable({
    data: renovations,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: (selection) => {
      setRowSelection(selection)
      // const selectedRenovations = table.getFilteredSelectedRowModel().rows.map((row) => row.original)
      //onSelected(selectedRenovations)
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter renovations..."
          value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('title')?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
          selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
