'use client';

import { withBasePath } from '@docs/utils/base-path';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import type React from 'react';
import { useMemo, useState } from 'react';
import './navbar.css';

import Logo from '@docs/components/logo';
import type { Language } from '@docs/utils/i18n';
import { enNavItems } from '@docs/utils/locales';
import { cn } from '@docs/utils/utils';
import Link from 'next/link';
import { LanguageSwitcherLink } from '@/components/language-switcher';
import { siteConfig } from '@/fumadocs.config';
import { useIsMobile } from '@/hooks/use-mobile';
import { NAV_ICON_MAP } from './config';
import { GithubStars } from './github-stars';
import { MenuIllustration } from './menu-illustration';
import { MobileNavbar } from './mobile-navbar';

type NavIconName = keyof typeof NAV_ICON_MAP;
type NavLinkItem = {
  type: 'link';
  label: string;
  href: string;
  icon?: NavIconName;
};
type NavMenuItem = {
  type: 'menu';
  label: string;
  icon?: NavIconName;
  defaultPreview?: string;
  items: Array<{
    label: string;
    href: string;
    description?: string;
    icon?: NavIconName;
    previewSection?: string;
  }>;
};
type NavItem = NavLinkItem | NavMenuItem;

export default function Navbar({
  className,
  language,
}: {
  className?: string;
  language?: Language;
}) {
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);
  const [_hoveredBlock, _setHoveredBlock] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const lang: Language = language ?? 'zh';
  const navItems = useMemo(
    () =>
      (lang === 'en' ? enNavItems : (siteConfig.navItems ?? [])) as NavItem[],
    [lang],
  );

  // Show mobile navbar on mobile devices
  if (isMobile) {
    return <MobileNavbar className={className} language={language} />;
  }

  return (
    <NavigationMenu.Root className={cn('navbar-menu', className)}>
      <a className="flex flex-1 items-center gap-2" href={withBasePath('/')}>
        <Logo />
      </a>
      <NavigationMenu.List className="menu-list flex-auto">
        {navItems.map((item) => {
          if (item.type === 'menu') {
            const Icon = item.icon ? NAV_ICON_MAP[item.icon] : null;
            const fallbackPreview =
              item.defaultPreview ?? item.items[0]?.previewSection ?? 'text';

            return (
              <NavigationMenu.Item key={item.label}>
                <NavigationMenu.Trigger className="trigger !cursor-default">
                  {Icon ? <Icon size={16} /> : null}
                  {item.label}
                </NavigationMenu.Trigger>
                <NavigationMenu.Content className="content">
                  <div className="enhanced-submenu">
                    <div className="submenu-nav">
                      <div className="submenu-items">
                        {item.items.map((child) => {
                          const ChildIcon = child.icon
                            ? NAV_ICON_MAP[child.icon]
                            : null;
                          return (
                            <EnhancedListItem
                              href={child.href}
                              icon={ChildIcon ? <ChildIcon size={20} /> : null}
                              key={child.href}
                              onHover={() =>
                                setHoveredComponent(
                                  child.previewSection ?? null,
                                )
                              }
                              onLeave={() => setHoveredComponent(null)}
                              title={child.label}
                            >
                              {child.description ?? ''}
                            </EnhancedListItem>
                          );
                        })}
                      </div>
                    </div>

                    <div className="submenu-preview">
                      <div className="flex h-full w-full items-center justify-center">
                        <MenuIllustration
                          activeSection={hoveredComponent ?? fallbackPreview}
                          className="h-full w-full"
                        />
                      </div>
                    </div>
                  </div>
                </NavigationMenu.Content>
              </NavigationMenu.Item>
            );
          }

          const Icon = item.icon ? NAV_ICON_MAP[item.icon] : null;
          return (
            <NavigationMenu.Item key={item.href}>
              <NavigationMenu.Link
                className="trigger"
                href={withBasePath(item.href)}
              >
                {Icon ? <Icon size={16} /> : null}
                {item.label}
              </NavigationMenu.Link>
            </NavigationMenu.Item>
          );
        })}
      </NavigationMenu.List>
      <div className="viewport-position">
        <NavigationMenu.Viewport className="viewport" />
      </div>
      <div className="flex flex-1 items-center justify-end gap-2">
        <LanguageSwitcherLink />
        <GithubStars />
      </div>
    </NavigationMenu.Root>
  );
}

interface EnhancedListItemProps {
  children: React.ReactNode;
  title: string;
  icon: React.ReactNode;
  href: string;
  onHover: () => void;
  onLeave: () => void;
}

function EnhancedListItem({
  children,
  title,
  icon,
  href,
  onHover,
  onLeave,
  ...props
}: EnhancedListItemProps) {
  return (
    <NavigationMenu.Link asChild>
      <Link
        className="enhanced-list-item-link"
        href={href}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        {...props}
      >
        <div className="enhanced-list-item-icon frame-box relative">{icon}</div>
        <div className="enhanced-list-item-content">
          <div className="enhanced-list-item-heading">{title}</div>
          <p className="enhanced-list-item-text">{children}</p>
        </div>
      </Link>
    </NavigationMenu.Link>
  );
}
