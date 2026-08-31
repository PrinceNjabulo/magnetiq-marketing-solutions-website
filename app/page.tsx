import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { WarningSigns } from "@/components/WarningSigns";
import { Solution } from "@/components/Solution";
import { Pricing } from "@/components/Pricing";
import { Testimonials } from "@/components/Testimonials";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { Footer } from "@/components/Footer";
import { ScrollProgress } from "@/components/ScrollProgress";
import { FloatingWhatsApp } from "@/components/WhatsAppButton";

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <Header />
      <main className="pb-16 sm:pb-0">
        <Hero />
        <WarningSigns />
        <Solution />
        <Pricing />
        <Testimonials />
        <WhyChooseUs />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
