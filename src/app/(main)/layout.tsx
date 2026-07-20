// src/app/(main)/layout.tsx
import HeaderSection from "@/components/sections/HeaderSection";
import HeroSection from "@/components/sections/HeroSection";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <HeaderSection />
      <HeroSection />
      <main className="flex-1 flex flex-col w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </>
  );
}