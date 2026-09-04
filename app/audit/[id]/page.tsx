import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { EyebrowLine, Reveal } from "@/components/motion/Reveal";
import { AuditStatusPoller } from "@/components/AuditStatusPoller";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Your Website Audit — MagnetiQ Marketing",
};

// Status changes after the first render (crawl -> analyze -> done), so this
// page must never be served from the Full Route Cache.
export const dynamic = "force-dynamic";

export default async function AuditStatusPage({ params }: { params: { id: string } }) {
  const audit = await db.audit.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      url: true,
      status: true,
      failureReason: true,
      lead: { select: { email: true } },
    },
  });

  if (!audit) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream">
        <section className="relative isolate overflow-hidden bg-navy px-5 pb-32 pt-32 sm:px-8">
          <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy to-navy-deep" />
          <div className="relative mx-auto max-w-2xl text-center">
            <Reveal>
              <EyebrowLine className="justify-center text-brand-blue">Your Free Audit</EyebrowLine>
              <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                We&apos;re on it
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-white/70">
                We&apos;ll email your report to {audit.lead.email} the moment it&apos;s ready.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="relative px-5 pb-24 sm:px-8">
          <div className="mx-auto -mt-16 max-w-xl sm:-mt-20">
            <Reveal delay={0.1}>
              <AuditStatusPoller
                initialAudit={{
                  id: audit.id,
                  url: audit.url,
                  status: audit.status,
                  failureReason: audit.failureReason,
                }}
              />
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
