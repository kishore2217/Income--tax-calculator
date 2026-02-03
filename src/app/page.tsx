import TaxCalculator from "@/components/TaxCalculator";

export default function Home() {
  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-cover bg-center bg-no-repeat bg-fixed relative" style={{ backgroundImage: "url('/background.png')" }}>
      <div className="absolute inset-0 bg-white/60 dark:bg-black/60 z-0 transition-colors duration-200"></div>
      <div className="max-w-7xl mx-auto relative z-10">
        <TaxCalculator />
      </div>
    </main>
  );
}
