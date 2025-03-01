'use client'

import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ACCOUNT_ROLES, AccountRole } from '@/modules/account/model'
import {
  getAccountUsers,
  resendInvite,
  updateUserRole,
  withOwnerAccess,
  cancelInvite,
  removeUser,
} from '@/modules/account/actions'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Loader2, MoreHorizontal } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { InviteUserDialog } from './InviteUserDialog'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

type User = {
  userId: string
  accountId: string
  role: AccountRole
  name: string | null
  email: string | null
  image: string | null
}

type Invite = {
  id: string
  accountId: string
  email: string
  role: AccountRole
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}

export function UsersSection({ accountId }: { accountId: string }) {
  const [users, setUsers] = useState<User[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingRole, setUpdatingRole] = useState<string | null>(null)
  const [resendingInvite, setResendingInvite] = useState<string | null>(null)
  const [cancellingInvite, setCancellingInvite] = useState<string | null>(null)
  const [removingUser, setRemovingUser] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    const checkAccess = async () => {
      const auth = await withOwnerAccess(accountId)
      if (auth instanceof Error) {
        setIsOwner(false)
        setLoading(false)
        return
      }
      setIsOwner(true)
      loadUsers()
    }
    checkAccess()
  }, [accountId])

  const loadUsers = async () => {
    try {
      const result = await getAccountUsers(accountId)
      if (result instanceof Error) {
        toast.error(result.message)
        return
      }
      setUsers(result.users)
      setInvites(result.invites)
    } catch {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: AccountRole) => {
    setUpdatingRole(userId)
    try {
      const result = await updateUserRole(accountId, userId, newRole)
      if (result instanceof Error) {
        toast.error(result.message)
        return
      }
      toast.success('Role updated successfully')
      loadUsers()
    } catch {
      toast.error('Failed to update role')
    } finally {
      setUpdatingRole(null)
    }
  }

  const handleResendInvite = async (inviteId: string) => {
    setResendingInvite(inviteId)
    try {
      const result = await resendInvite(inviteId)
      if (result instanceof Error) {
        toast.error(result.message)
        return
      }
      toast.success('Invite resent successfully')
      loadUsers()
    } catch {
      toast.error('Failed to resend invite')
    } finally {
      setResendingInvite(null)
    }
  }

  const handleCancelInvite = async (inviteId: string) => {
    setCancellingInvite(inviteId)
    try {
      const result = await cancelInvite(inviteId)
      if (result instanceof Error) {
        toast.error(result.message)
        return
      }
      toast.success('Invite cancelled successfully')
      loadUsers()
    } catch {
      toast.error('Failed to cancel invite')
    } finally {
      setCancellingInvite(null)
    }
  }

  const handleRemoveUser = async (userId: string) => {
    setRemovingUser(userId)
    try {
      const result = await removeUser(accountId, userId)
      if (result instanceof Error) {
        toast.error(result.message)
        return
      }
      toast.success('User removed successfully')
      loadUsers()
    } catch {
      toast.error('Failed to remove user')
    } finally {
      setRemovingUser(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isOwner) {
    return (
      <Alert>
        <div className="flex align-middle gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0 self-center" />
          <AlertDescription className="m-0">
            You must be an owner of this account to access users and permissions settings.
          </AlertDescription>
        </div>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <InviteUserDialog accountId={accountId} onInviteComplete={loadUsers} />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.userId}>
                <TableCell className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image || undefined} />
                    <AvatarFallback>{user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Select
                    value={user.role}
                    onValueChange={(value: AccountRole) => handleRoleChange(user.userId, value)}
                    disabled={updatingRole === user.userId || removingUser === user.userId}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACCOUNT_ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium">Active</span>
                </TableCell>
                <TableCell>
                  {removingUser === user.userId ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleRemoveUser(user.userId)}>
                          Remove from account
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {invites
              .filter((invite) => invite.status === 'pending')
              .map((invite) => (
                <TableRow key={invite.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{invite.email}</div>
                      <div className="text-sm text-muted-foreground">Pending invite</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">{invite.role}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium text-yellow-600">Pending</span>
                  </TableCell>
                  <TableCell>
                    {resendingInvite === invite.id || cancellingInvite === invite.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleResendInvite(invite.id)}>
                            Resend invite
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCancelInvite(invite.id)}>
                            Cancel invite
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
