'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'

interface AddSubredditModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (subreddit: { name: string; url: string }) => void
}

export function AddSubredditModal({ isOpen, onClose, onAdd }: AddSubredditModalProps) {
  const [url, setUrl] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const name = url.split('/').filter(Boolean).pop() || ''
    onAdd({ name, url })
    setUrl('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Subreddit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="subreddit-url">Subreddit URL</Label>
            <Input
              id="subreddit-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.reddit.com/r/subredditname/"
              required
            />
          </div>
          <Button type="submit">Add Subreddit</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}