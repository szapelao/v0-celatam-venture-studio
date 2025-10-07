import { ConversationalChat } from "@/components/conversational-chat"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Conversational Chat - starts immediately */}
      <div className="flex-1">
        <ConversationalChat />
      </div>
    </div>
  )
}
