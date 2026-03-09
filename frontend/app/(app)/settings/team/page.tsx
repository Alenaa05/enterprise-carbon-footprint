import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export default function TeamSettingsPage() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Team Access</CardTitle>
          <CardDescription>Manage team members and permissions.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">Invite members, assign roles, and configure access control.</p>
        </CardContent>
      </Card>
    </div>
  )
}
