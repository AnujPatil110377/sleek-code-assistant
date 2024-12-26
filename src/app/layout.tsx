import AIChatWindow from '@/components/AIChatWindow'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white">
      <AIChatWindow />
      {children}
    </div>
  )
} 