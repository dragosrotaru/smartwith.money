'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { FormDataProps } from '../formData'

export default function InvitePeopleStep({
  formData,
  updateFormData,
  onPersonFilledButNotAdded,
}: {
  formData: FormDataProps
  updateFormData: (data: Partial<FormDataProps>) => void
  onPersonFilledButNotAdded: (hasIncompleteFields: boolean) => void
}) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')

  // Check for incomplete fields whenever email or role changes
  useEffect(() => {
    onPersonFilledButNotAdded(email.length > 0 || role.length > 0)
  }, [email, role, onPersonFilledButNotAdded])

  const addPerson = () => {
    if (email && role) {
      updateFormData({
        invitedPeople: [...formData.invitedPeople, { email, role }],
      })
      setEmail('')
      setRole('')
    }
  }

  const removePerson = (index: number) => {
    const updatedPeople = [...formData.invitedPeople]
    updatedPeople.splice(index, 1)
    updateFormData({
      invitedPeople: updatedPeople,
    })
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Invite Others (Optional)</h2>
      <p className="text-sm text-gray-500">
        Invite your partner, family members, advisors or agents to collaborate with you on this account.
      </p>
      <h3 className="text-lg font-semibold">Examples</h3>
      <p className="text-sm text-gray-500">
        <span className="font-bold">Partner:</span> If you want to allow your partner to add properties, points of
        interest, renovation ideas - <span className="font-bold">then set them as an Owner or Editor.</span>
      </p>
      <p className="text-sm text-gray-500">
        <span className="font-bold">Realtor:</span> If you want to allow your realtor to view your favourite properties
        - <span className="font-bold">then set them as a Viewer.</span>
      </p>
      <div className="flex items-end gap-4">
        <div className="flex-1 space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="partner@example.com"
          />
        </div>
        <div className="flex-1 space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="owner">Owner</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={addPerson} variant="outline" disabled={!email || !role}>
          Add Person
        </Button>
      </div>
      <div className="mt-4">
        {formData.invitedPeople.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formData.invitedPeople.map((person, index) => (
                <TableRow key={index}>
                  <TableCell>{person.email}</TableCell>
                  <TableCell className="capitalize">{person.role}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePerson(index)}
                      className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-100"
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground">No people invited yet.</p>
        )}
      </div>
    </div>
  )
}
