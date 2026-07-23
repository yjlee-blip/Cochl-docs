import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/notebook';
import { baseOptions } from '@/lib/layout.shared';
import { MobileFooterLinks } from '@/components/mobile-footer-links';
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
          if (!icon) return option;
          return {
            ...option,
            // dedicated icon slot — used by the mobile/narrow tab dropdown,
            // which already lays icon + title out horizontally on its own
            icon,
            // the desktop navbar tab bar ignores `icon` and only renders
            // `title`, so it needs the icon baked in — hidden below `lg`
            // so the mobile dropdown (which renders its own `icon` already)
            // doesn't end up showing it twice
            title: (
              <>
                <span aria-hidden className="hidden lg:inline-flex">{icon}</span>
                {option.title}
              </>
            ),
          };
        },
      }}
      sidebar={{ footer: MobileFooterLinks }}
      {...baseOptions()}
    >
      {children}
    </DocsLayout>
  );
}
