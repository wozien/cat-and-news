import { GeneratePanel } from "@/components/briefings/generate-panel";

export default function HomePage() {
  return (
    <div className="grid gap-6">
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-primary">今日简讯</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">把订阅源收成一篇冷静的日报</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          先确认个人中心的 RSS 与默认模型，再一键生成 Markdown，预览无误后保存。
        </p>
      </div>
      <GeneratePanel />
    </div>
  );
}
