import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full relative flex flex-col md:flex-row">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
        <Sidebar />
      </div>
      
      {/* Navbar Mobile (fixed on top) */}
      <div className="md:hidden sticky top-0 z-50">
        <MobileNav />
      </div>

      <main className="md:pl-72 flex-1 w-full h-full">
        {children}
      </main>
    </div>
  );
}
