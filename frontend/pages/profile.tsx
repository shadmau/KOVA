import AppLayout from "@/components/AppLayout";
import ProfilePage from "@/components/ProfilePage";

export default function CreateAgentPage() {
  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50/80 py-8">
        <ProfilePage />
      </div>
    </AppLayout>
  );
}
