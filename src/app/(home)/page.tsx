import Link from 'next/link';
import { ArrowRight, CircleHelp, Cloud, Cpu, House, Shield } from 'lucide-react';

const entryPoints = [
  {
    href: '/docs/home/introduction',
    icon: House,
    title: 'Home',
    description: 'What Cochl.Sense is, and how to get your dashboard set up.',
    accent: 'home',
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
  home: 'bg-[#16a34a]/10 text-[#16a34a] group-hover:bg-[#16a34a]/15',
  cloud: 'bg-[#832bfb]/10 text-[#832bfb] group-hover:bg-[#832bfb]/15',
  edge: 'bg-brand-60/10 text-brand-60 group-hover:bg-brand-60/15',
  security: 'bg-[#d97706]/10 text-[#d97706] group-hover:bg-[#d97706]/15',
};

const borderHoverClasses: Record<(typeof entryPoints)[number]['accent'], string> = {
  home: 'hover:border-[#16a34a]/40',
  cloud: 'hover:border-[#832bfb]/40',
  edge: 'hover:border-brand-60/40',
  security: 'hover:border-[#d97706]/40',
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
    <section className="relative overflow-hidden px-6 pt-24 pb-20 text-center sm:pt-32 sm:pb-24">
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-12rem] left-1/2 h-[28rem] w-[42rem] -translate-x-1/2 rounded-full opacity-[0.16] blur-[110px]"
        style={{
          background: 'linear-gradient(115deg, #832bfb, #4b68ff)',
        }}
      />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center">
        <div className="mb-7 flex items-center gap-2 text-xs font-medium tracking-[0.14em] text-fd-muted-foreground uppercase">
          <span>Documentation</span>
        </div>

        <h1 className="text-6xl font-bold tracking-tight text-fd-foreground sm:text-7xl">
          Cochl.Sense
        </h1>
        <p className="mt-6 max-w-xl text-xl text-fd-muted-foreground sm:text-2xl">
          Turn audio into structured insight — sound events, speech, and scene
          context — from the cloud to the edge.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/docs/home/introduction"
            className="inline-flex items-center gap-2.5 rounded bg-fd-primary px-8 py-4 text-lg font-semibold text-fd-primary-foreground transition-colors hover:bg-brand-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring"
          >
            Get Started
            <ArrowRight className="size-5" />
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
        {entryPoints.map((item, index) => (
          <EntryCard key={item.href} index={index} {...item} />
        ))}
      </div>
    </section>
  );
}

function EntryCard(props: (typeof entryPoints)[number] & { index: number }) {
  const { href, icon: Icon, title, description, accent, index } = props;
  return (
    <Link
      href={href}
      style={{ animationDelay: `${index * 80}ms` }}
      className={`group flex flex-col gap-3 rounded border border-fd-border bg-white px-5 py-[30px] transition-all hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring animate-fade-up dark:bg-fd-card ${borderHoverClasses[accent]}`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`flex size-9 items-center justify-center rounded transition-colors ${accentClasses[accent]}`}
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
