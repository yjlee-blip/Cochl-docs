import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { appName, externalLinks } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo/header_logo_light.png"
            alt={appName}
            className="h-6 w-auto dark:hidden"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo/header_logo_dark.png"
            alt={appName}
            className="hidden h-6 w-auto dark:block"
          />
        </>
      ),
    },
    links: [
      {
        type: 'main',
        text: 'Dashboard',
        url: externalLinks.dashboard,
        external: true,
        // shown in the desktop top nav; the mobile menu gets its own copy
        // pinned to the bottom instead (see docs/layout.tsx sidebar.footer)
        on: 'nav',
      },
      {
        type: 'main',
        text: 'Contact us',
        url: externalLinks.contactUs,
        external: true,
        on: 'nav',
      },
    ],
  };
}
