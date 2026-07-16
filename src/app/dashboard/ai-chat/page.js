import { redirect } from "next/navigation";

// AI Chat has been removed. Redirect any direct links back to the dashboard.
export default function AIChatPage() {
  redirect("/dashboard/");
}
