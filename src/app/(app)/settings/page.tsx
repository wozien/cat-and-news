import { LlmPanel } from "@/components/settings/llm-panel";
import { ProfilePanel } from "@/components/settings/profile-panel";
import { RssPanel } from "@/components/settings/rss-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-medium text-primary">个人中心</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">配置源、模型与资料</h2>
      </div>
      <Tabs defaultValue="rss">
        <TabsList>
          <TabsTrigger value="rss">RSS 源</TabsTrigger>
          <TabsTrigger value="llm">大模型</TabsTrigger>
          <TabsTrigger value="profile">资料</TabsTrigger>
        </TabsList>
        <TabsContent value="rss">
          <RssPanel />
        </TabsContent>
        <TabsContent value="llm">
          <LlmPanel />
        </TabsContent>
        <TabsContent value="profile">
          <ProfilePanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
