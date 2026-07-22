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
        text: 'Contact us',
        url: externalLinks.contactUs,
        external: true,
      },
      {
        type: 'button',
        text: 'Dashboard',
        url: externalLinks.dashboard,
        external: true,
      },
    ],
  };
}
