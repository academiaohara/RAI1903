import { MediaRaiSectionPage } from "@/components/media-rai/MediaRaiSectionPage";

export default async function MediaRaiSectionRoute({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  return <MediaRaiSectionPage sectionSlug={section} />;
}
