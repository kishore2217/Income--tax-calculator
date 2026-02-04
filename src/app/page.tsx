import TaxCalculator from "@/components/TaxCalculator";

export default function Home() {
  return (
    <main className="min-h-screen relative bg-white dark:bg-gray-900 md:bg-gray-100 md:dark:bg-gray-900">
      {/* Background Image & Overlay - Desktop Only */}
      <div className="hidden md:block absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed"
          style={{ backgroundImage: "url('/background.png')" }}
        />
        <div className="absolute inset-0 bg-white/60 dark:bg-black/60 transition-colors duration-200" />
      </div>

      {/* Content */}
      <div className="relative z-10 md:min-h-0 md:py-12 px-0 md:px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto md:block">
        <TaxCalculator />
      </div>
    </main>
  );
}
