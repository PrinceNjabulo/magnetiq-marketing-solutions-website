import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AuditForm } from "@/components/AuditForm";
import { EyebrowLine, Reveal } from "@/components/motion/Reveal";
import { audit } from "@/lib/content";

export const metadata: Metadata = {
  title: "Free Website Audit — MagnetiQ Marketing",
  description:
    "Get a free, AI-powered audit of your website's SEO, performance, mobile experience, and conversion opportunities.",
};

export default function AuditPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream">
        <section className="relative isolate overflow-hidden bg-navy px-5 pb-32 pt-32 sm:px-8">
          <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy to-navy-deep" />
          <div className="relative mx-auto max-w-2xl text-center">
            <Reveal>
              <EyebrowLine className="justify-center text-brand-blue">{audit.eyebrow}</EyebrowLine>
              <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {audit.heading}
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-white/70">{audit.subhead}</p>
            </Reveal>
          </div>
        </section>

        <section className="relative px-5 pb-24 sm:px-8">
          <div className="mx-auto -mt-16 max-w-xl sm:-mt-20">
            <Reveal delay={0.1}>
              <div className="rounded-2xl bg-white p-6 shadow-card sm:p-8">
                <AuditForm />
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
