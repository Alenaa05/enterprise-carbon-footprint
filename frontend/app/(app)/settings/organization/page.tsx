"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { useEffect, useState } from 'react'

type DecodedToken = {
  email?: string
  ['custom:organization']?: string
  name?: string
}

export default function OrganizationSettingsPage() {
  const [user, setUser] = useState<DecodedToken | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const [, payload] = token.split('.')
      const decoded = JSON.parse(atob(payload))
      setUser(decoded)
    } catch {
      // ignore decode errors
    }
  }, [])

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Organization Settings</CardTitle>
          <CardDescription>Manage organization profile and basic settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Update organization name, address, contact details, and timezone.
          </p>
          {user && (
            <div className="space-y-1 text-sm text-gray-700">
              <p>
                <span className="font-medium">Organization:</span>{' '}
                {user['custom:organization'] || 'Not set'}
              </p>
              <p>
                <span className="font-medium">User:</span>{' '}
                {user.name || user.email || 'Unknown'}
              </p>
              <p>
                <span className="font-medium">Email:</span>{' '}
                {user.email || 'Unknown'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
