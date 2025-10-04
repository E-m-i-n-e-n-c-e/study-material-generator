import Header from "@/components/Home/Header";
import Footer from "@/components/Home/Footer";
import TranscriptViewer from "@/components/Transcript/TranscriptViewer";

export default function TranscriptPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const vParam = searchParams?.v;
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
