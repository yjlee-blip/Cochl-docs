'use client';

import { externalLinks } from '@/lib/shared';
import { SidebarItem } from 'fumadocs-ui/components/sidebar/base';

// The mobile sidebar menu otherwise puts "main" nav links (Dashboard,
// Contact us — see layout.shared.tsx, marked `on: 'nav'` so they don't
// also render there) above the page tree. Pin them to the bottom instead.
//
// Passed to <DocsLayout sidebar={{ footer: MobileFooterLinks }}> as a
// function so Fumadocs calls it directly, bypassing its default footer
// wrapper (which stays hidden unless there are icon-type nav links).
export function MobileFooterLinks() {
  return (
    <div className="flex flex-col gap-0.5 border-t px-4 pt-2 pb-3 lg:hidden">
      <SidebarItem href={externalLinks.dashboard} external>
        Dashboard
      </SidebarItem>
      <SidebarItem href={externalLinks.contactUs} external>
        Contact us
      </SidebarItem>
    </div>
  );
}
