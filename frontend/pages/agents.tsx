import AppLayout from "@/components/AppLayout";
import InvestorSelection from "@/components/InvestorSelection";
import MatchedAgents from "@/components/MatchedAgents";
import { useSearchParams } from "next/navigation";

export default function CreateAgentPage() {
   const searchParams = useSearchParams();
   const hasQueryParams = searchParams.toString().length > 0;

   if (!hasQueryParams) {
     return (
       <AppLayout>
         <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50/80 py-8">
           <InvestorSelection />
         </div>
       </AppLayout>
     );
   }
  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50/80 py-8">
        <MatchedAgents />
      </div>
    </AppLayout>
  );
}
