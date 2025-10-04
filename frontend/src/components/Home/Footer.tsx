export default function Footer() {
  return (
    <footer className="mt-16 border-t py-6 text-center text-sm text-gray-500">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        © {new Date().getFullYear()} Study Material Generator
      </div>
    </footer>
  );
}


