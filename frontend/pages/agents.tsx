import AppLayout from "@/components/AppLayout";
import MatchedAgents from "@/components/MatchedAgents";

export default function CreateAgentPage() {
  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50/80 py-8">
        <MatchedAgents />
      </div>
    </AppLayout>
  );
}
