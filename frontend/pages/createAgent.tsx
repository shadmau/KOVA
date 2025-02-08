import AppLayout from "@/components/AppLayout";
import CreateAgentForm from "@/components/createAgentForm";

export default function CreateAgentPage() {
  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50/80 py-8">
        <CreateAgentForm contractAddress="0xEF78E7D23A02a404D348a0f37ac0fF4D10991D1a" />
      </div>
    </AppLayout>
  );
}
