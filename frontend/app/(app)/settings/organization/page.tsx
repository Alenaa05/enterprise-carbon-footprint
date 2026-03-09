import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export default function OrganizationSettingsPage() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Organization Settings</CardTitle>
          <CardDescription>Manage organization profile and basic settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">Update organization name, address, contact details, and timezone.</p>
        </CardContent>
      </Card>
    </div>
  )
}
