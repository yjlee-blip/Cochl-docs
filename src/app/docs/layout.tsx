import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/notebook';
import { baseOptions } from '@/lib/layout.shared';
import { CircleHelp, Cloud, Cpu, House, Shield } from 'lucide-react';
import type { ReactNode } from 'react';

const TAB_ICONS: Record<string, ReactNode> = {
  Home: <House className="size-4" />,
  'Cochl.Sense Cloud API': <Cloud className="size-4" />,
  'Cochl.Sense Edge SDK': <Cpu className="size-4" />,
  'Cochl Security': <Shield className="size-4" />,
  FAQs: <CircleHelp className="size-4" />,
};

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <DocsLayout
      tree={source.getPageTree()}
      tabMode="navbar"
      tabs={{
        transform(option) {
          const icon = TAB_ICONS[String(option.title)];
          return icon ? { ...option, title: <><span aria-hidden>{icon}</span>{option.title}</> } : option;
        },
      }}
      {...baseOptions()}
    >
      {children}
    </DocsLayout>
  );
}
