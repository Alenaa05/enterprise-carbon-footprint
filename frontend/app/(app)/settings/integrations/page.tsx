import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export default function IntegrationsSettingsPage() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>Configure external integrations (AWS, SSO, analytics).</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">Add or remove integrations such as S3, Cognito, and monitoring tools.</p>
        </CardContent>
      </Card>
    </div>
  )
}
