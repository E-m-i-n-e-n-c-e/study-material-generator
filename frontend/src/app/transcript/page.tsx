import Header from "@/components/Home/Header";
import Footer from "@/components/Home/Footer";
import TranscriptViewer from "@/components/Transcript/TranscriptViewer";

export default async function TranscriptPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const vParam = sp?.v;
  const videoId = Array.isArray(vParam) ? vParam[0] : vParam;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <TranscriptViewer videoId={videoId} />
      </main>
      <Footer />
    </div>
  );
}
