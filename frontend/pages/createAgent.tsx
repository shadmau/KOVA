import AppLayout from "@/components/AppLayout";
import CreateAgentForm from "@/components/createAgentForm";

export default function CreateAgentPage() {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50/80 py-8">
          <CreateAgentForm contractAddress="0x222BeC22E51ee73363Fde9eB6f4212FA7f9780bc" />
        </div>
      </AppLayout>
    );
}
