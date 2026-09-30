import { DetailPanel } from "@/components/briefings/detail-panel";

export default async function BriefingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DetailPanel id={id} />;
}
