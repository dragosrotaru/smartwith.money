'use client'
import { useState, useCallback, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { updateName, updateProfilePicture } from '@/modules/account/actions'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Upload } from 'lucide-react'

export default function ProfileSettings() {
  const { data: session, update: updateSession } = useSession()
  const [name, setName] = useState('')
  const [isLoadingName, setIsLoadingName] = useState(false)
  const [isLoadingImage, setIsLoadingImage] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isChangingImage, setIsChangingImage] = useState(false)

  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name)
    }
  }, [session?.user?.name])

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedName = name.trim()

    if (trimmedName === session?.user?.name) {
      toast.error('Please enter a different name')
      return
    }

    setIsLoadingName(true)
    const result = await updateName(trimmedName)
    if (result instanceof Error) {
      toast.error(result.message)
    } else {
      toast.success('Your name has been updated successfully')
      setName('')
      await updateSession()
    }
    setIsLoadingName(false)
  }

  const handleFileUpload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file')
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB')
        return
      }

      setIsLoadingImage(true)
      const result = await updateProfilePicture(file)
      if (result instanceof Error) {
        toast.error(result.message)
      } else {
        toast.success('Your profile picture has been updated successfully')
        await updateSession()
        setIsChangingImage(false)
      }
      setIsLoadingImage(false)
    },
    [updateSession, setIsChangingImage],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file) {
        await handleFileUpload(file)
      }
    },
    [handleFileUpload],
  )

  return (
    <Card className="p-8">
      <h2 className="text-xl font-semibold mb-8">Profile Settings</h2>

      <div className="grid gap-8">
        {/* Profile Picture Section */}
        <div>
          <div className="flex items-center gap-6 mb-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={session?.user?.image || undefined} />
              <AvatarFallback>
                {session?.user?.name?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Profile Picture</Label>
                  <p className="text-sm text-muted-foreground mt-1">Upload a new profile picture</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsChangingImage(!isChangingImage)}
                  disabled={isLoadingImage}
                >
                  {isChangingImage ? 'Cancel' : 'Change'}
                </Button>
              </div>
            </div>
          </div>

          {isChangingImage && (
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 transition-colors ${
                isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    handleFileUpload(file)
                  }
                }}
                disabled={isLoadingImage}
              />
              <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <Upload className="h-8 w-8" />
                <p className="text-sm">{isLoadingImage ? 'Uploading...' : 'Drop your image here or click to browse'}</p>
                <p className="text-xs">Maximum file size: 5MB</p>
              </div>
            </div>
          )}
        </div>

        {/* Name Section */}
        <div>
          <div className="mb-6">
            <Label className="text-base">Display Name</Label>
            <p className="text-sm text-muted-foreground mt-1">Update your display name</p>
          </div>

          <form onSubmit={handleUpdateName}>
            <div className="flex gap-3">
              <Input
                type="text"
                placeholder="Enter new display name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Button type="submit" disabled={isLoadingName || !name.trim() || name.trim() === session?.user?.name}>
                {isLoadingName ? 'Updating...' : 'Update Name'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Card>
  )
}
