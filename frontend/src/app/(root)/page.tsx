import Header from "@/components/Home/Header";
import Hero from "@/components/Home/Hero";
import Features from "@/components/Home/Features";
import Footer from "@/components/Home/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
      </main>
      <Footer />
    </div>
  );
}


