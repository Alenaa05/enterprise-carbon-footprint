import { redirect } from "next/navigation";

/**
 * /settings redirects to /settings/organization (the main settings sub-page).
 * Sub-pages: /settings/organization, /settings/team, /settings/integrations
 */
export default function SettingsPage() {
  redirect("/settings/organization");
}
