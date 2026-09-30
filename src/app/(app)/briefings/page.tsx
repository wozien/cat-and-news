import { HistoryPanel } from "@/components/briefings/history-panel";

export default function BriefingsPage() {
  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-medium text-primary">历史简讯</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">回看已经保存的日报</h2>
      </div>
      <HistoryPanel />
    </div>
  );
}
