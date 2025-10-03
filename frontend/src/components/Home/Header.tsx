export default function Header() {
  return (
    <header className="border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="text-xl font-semibold">Study Material Generator</div>
        <nav className="text-sm text-gray-600">
          <a href="#features" className="hover:text-black">Features</a>
        </nav>
      </div>
    </header>
  );
}


