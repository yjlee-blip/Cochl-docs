import Link from 'next/link';
import { ArrowRight, CircleHelp, Cloud, Cpu, House, Shield } from 'lucide-react';

const entryPoints = [
  {
    href: '/docs/home/introduction',
    icon: House,
    title: 'Home',
    description: 'What Cochl.Sense is, and how to get your dashboard set up.',
    accent: 'neutral',
  },
  {
    href: '/docs/cloud-api/getting-started',
    icon: Cloud,
    title: 'Cochl.Sense Cloud API',
    description:
      'Send audio over HTTP to detect sound events, transcribe speech, and get scene-level insight.',
    accent: 'cloud',
  },
  {
    href: '/docs/edge-sdk/getting-started',
    icon: Cpu,
    title: 'Cochl.Sense Edge SDK',
    description: 'Run sound event detection on-device, in Python, C++, or Android.',
    accent: 'edge',
  },
  {
    href: '/docs/security/introduction',
    icon: Shield,
    title: 'Cochl Security',
    description: 'On-device audio security for facilities — plans, hardware, and support.',
    accent: 'security',
  },
] as const;

const accentClasses: Record<(typeof entryPoints)[number]['accent'], string> = {
  neutral: 'bg-fd-foreground/[0.06] text-fd-foreground group-hover:bg-fd-foreground/10',
  cloud: 'bg-[#832bfb]/10 text-[#832bfb] group-hover:bg-[#832bfb]/15',
  edge: 'bg-brand-60/10 text-brand-60 group-hover:bg-brand-60/15',
  security: 'bg-fd-foreground/[0.06] text-fd-foreground group-hover:bg-fd-foreground/10',
};

const borderHoverClasses: Record<(typeof entryPoints)[number]['accent'], string> = {
  neutral: 'hover:border-fd-foreground/20',
  cloud: 'hover:border-[#832bfb]/40',
  edge: 'hover:border-brand-60/40',
  security: 'hover:border-fd-foreground/20',
};

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <Hero />
      <EntryPoints />
      <Footnote />
    </main>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-20 pb-16 text-center sm:pt-28 sm:pb-20">
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-12rem] left-1/2 h-[28rem] w-[42rem] -translate-x-1/2 rounded-full opacity-[0.16] blur-[110px]"
        style={{
          background: 'linear-gradient(115deg, #832bfb, #4b68ff)',
        }}
      />

      <div className="relative mx-auto flex max-w-2xl flex-col items-center">
        <div className="mb-6 flex items-center gap-2 text-xs font-medium tracking-[0.14em] text-fd-muted-foreground uppercase">
          <span>Documentation</span>
        </div>

        <h1 className="text-4xl font-medium tracking-tight text-fd-foreground sm:text-5xl">
          Cochl.Sense
        </h1>
        <p className="mt-4 max-w-lg text-base text-fd-muted-foreground sm:text-lg">
          Turn audio into structured insight — sound events, speech, and scene
          context — from the cloud to the edge.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/docs/home/introduction"
            className="inline-flex items-center gap-2 rounded-lg bg-fd-primary px-5 py-2.5 text-sm font-medium text-fd-primary-foreground transition-colors hover:bg-brand-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring"
          >
            Get Started
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/docs/cloud-api/rest-api-reference"
            className="inline-flex items-center gap-2 rounded-lg border border-fd-border px-5 py-2.5 text-sm font-medium text-fd-foreground transition-colors hover:bg-fd-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring"
          >
            API Reference
          </Link>
        </div>
      </div>
    </section>
  );
}

function EntryPoints() {
  return (
    <section className="mx-auto w-full max-w-4xl px-6 pb-20">
      <div className="mb-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-fd-border" />
        <span className="text-xs font-medium tracking-[0.14em] text-fd-muted-foreground uppercase">
          Start here
        </span>
        <span className="h-px flex-1 bg-fd-border" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {entryPoints.map((item) => (
          <EntryCard key={item.href} {...item} />
        ))}
      </div>
    </section>
  );
}

function EntryCard(props: (typeof entryPoints)[number]) {
  const { href, icon: Icon, title, description, accent } = props;
  return (
    <Link
      href={href}
      className={`group flex flex-col gap-3 rounded-xl border border-fd-border bg-fd-card p-5 transition-all hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring ${borderHoverClasses[accent]}`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`flex size-9 items-center justify-center rounded-lg transition-colors ${accentClasses[accent]}`}
        >
          <Icon className="size-[18px]" />
        </span>
        <ArrowRight className="size-4 -translate-x-1 text-fd-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
      </div>
      <div>
        <h3 className="text-sm font-medium text-fd-foreground">{title}</h3>
        <p className="mt-1 text-sm text-fd-muted-foreground">{description}</p>
      </div>
    </Link>
  );
}

function Footnote() {
  return (
    <section className="mx-auto mb-16 flex w-full max-w-4xl items-center justify-center gap-2 px-6 text-sm text-fd-muted-foreground">
      <CircleHelp className="size-4" />
      <span>Have a question?</span>
      <Link href="/docs/faqs" className="font-medium text-fd-foreground underline underline-offset-4">
        Check the FAQs
      </Link>
    </section>
  );
}
