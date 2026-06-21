import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="pt-[150px]">
        {children}
      </main>

      <Footer />
    </div>
  );
}