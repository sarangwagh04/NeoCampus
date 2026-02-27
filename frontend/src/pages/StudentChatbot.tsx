import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ChatInterface } from "@/components/chatbot/ChatInterface";

export default function StudentChatbot() {
  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden rounded-lg border border-border bg-background shadow-sm">
        <ChatInterface variant="dashboard" />
      </div>
    </DashboardLayout>
  );
}
