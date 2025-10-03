const items = [
  {
    title: "Transcript Extraction",
    desc: "Fetches available YouTube transcripts with loading and error states.",
  },
  {
    title: "Smart Structuring",
    desc: "Groups content into topics with headings, bullets, and highlights.",
  },
  {
    title: "Clear Output",
    desc: "Presents Enhanced Study Material with summaries and takeaways.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-12 sm:py-16">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-semibold">Features</h2>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.title} className="rounded-lg border bg-white p-5 shadow-sm">
              <div className="text-lg font-medium">{item.title}</div>
              <p className="mt-2 text-gray-600 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


