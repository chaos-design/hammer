'use client';

import { cn } from '@chaos-design/shadcn-kits';
import { type Theme, ThemeSwitch } from '@chaos-design/theme-switch';
import { Sunrise, Sunset } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';

/**
 * One card per configuration of `ThemeSwitch`, so every prop in the docs table
 * has something you can click.
 *
 * Almost every card is uncontrolled: it owns its state, persists it under a
 * `localStorage` key and fans the change out to every other switch on the page,
 * which is why picking a theme in one card moves all the others — that shared
 * behaviour is the point of showing eight switches at once. The single
 * controlled card is the exception, and it is what demonstrates `value`.
 *
 * Every uncontrolled card keeps `system` as its effective theme on mount,
 * because each one applies its own theme to the document when it mounts: a card
 * that started on `dark` would decide the page's initial appearance for every
 * visitor.
 *
 * `attribute` is deliberately absent. It is a document-wide strategy — the
 * package writes `data-theme` and *removes* the `.dark` class — and this site
 * keys its dark tokens off `.dark`, so a `data-theme` switch on this page would
 * silently disable dark mode for every card around it. It is documented with a
 * snippet on the docs page instead.
 */

function DemoCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border bg-card p-5">
      <div>
        <h3 className="font-semibold text-sm">{title}</h3>
        <p className="mt-1 text-muted-foreground text-xs">{description}</p>
      </div>
      <div className="flex min-h-14 flex-wrap items-center justify-center gap-4">
        {children}
      </div>
    </section>
  );
}

/** A surface painted with the theme tokens, so a swap is visible. */
function ThemeProbe({ children }: { children?: ReactNode }) {
  return (
    <div className="flex w-full max-w-64 items-center gap-3 rounded-md border bg-background px-4 py-3 text-foreground">
      <span className="size-4 shrink-0 rounded-full bg-foreground" />
      <span className="truncate text-xs">{children}</span>
    </div>
  );
}

/**
 * What a controlled parent is holding, plus the buttons that drive it — the
 * point of a controlled switch is that the parent, not the menu, owns the value.
 */
function ControlledReadout({
  theme,
  onChange,
  options,
}: {
  theme: Theme;
  onChange: (theme: Theme) => void;
  options: readonly Theme[];
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {options.map((choice) => (
        <button
          key={choice}
          type="button"
          onClick={() => onChange(choice)}
          aria-pressed={theme === choice}
          className={cn(
            'rounded-md border px-2 py-1 font-mono text-xs transition-colors',
            theme === choice
              ? 'border-primary bg-primary/10 text-foreground'
              : 'text-muted-foreground hover:bg-muted',
          )}
        >
          {choice}
        </button>
      ))}
    </div>
  );
}

export function ThemeSwitchOptions() {
  // Seeded with `system` so the controlled card resolves to the same theme as
  // the uncontrolled ones when it mounts, instead of overriding the page.
  const [controlled, setControlled] = useState<Theme>('system');

  return (
    <div className="flex flex-col gap-4 bg-background p-4 text-foreground">
      <div className="grid gap-4 md:grid-cols-2">
        <DemoCard
          title="默认用法"
          description="不传任何属性：默认跟随系统，选择写入 localStorage，页面上的多个开关互相同步。"
        >
          <ThemeSwitch />
          <ThemeProbe>background / foreground 随主题翻转</ThemeProbe>
        </DemoCard>

        <DemoCard
          title="自定义文案 · labels / triggerLabel"
          description="labels 覆盖菜单项文本（国际化），triggerLabel 覆盖触发按钮的 aria-label。"
        >
          <ThemeSwitch
            labels={{ light: '浅色', dark: '深色', system: '跟随系统' }}
            triggerLabel="切换站点主题"
          />
        </DemoCard>

        <DemoCard
          title="自定义图标 · icons"
          description="只覆盖 light 与 dark，system 仍回落到默认的 lucide Monitor 图标 —— icons 是 Partial。"
        >
          <ThemeSwitch icons={{ light: Sunrise, dark: Sunset }} />
        </DemoCard>

        <DemoCard
          title="不提供“跟随系统” · enableSystem"
          description="enableSystem={false} 时菜单只剩浅色与深色两项，适合只提供两套主题的应用。"
        >
          <ThemeSwitch enableSystem={false} />
          <ThemeProbe>菜单中不再出现 System</ThemeProbe>
        </DemoCard>

        <DemoCard
          title="受控用法 · value / onValueChange"
          description="传入 value 后由父组件持有状态：组件仍然应用主题，但不再写入存储、不再同步其他开关。"
        >
          <ThemeSwitch value={controlled} onValueChange={setControlled} />
          <ControlledReadout
            theme={controlled}
            onChange={setControlled}
            options={['light', 'dark', 'system']}
          />
        </DemoCard>

        <DemoCard
          title="样式定制 · className / classNames"
          description="className 作用于触发按钮，classNames 逐个覆盖 trigger / content / item / icon。"
        >
          <ThemeSwitch
            className="size-11 rounded-full border bg-background shadow-sm"
            classNames={{
              trigger: 'rounded-full border',
              content: 'w-56',
              item: 'gap-3 rounded-md',
              icon: 'size-5',
            }}
          />
        </DemoCard>

        <DemoCard
          title="独立存储键 · storageKey"
          description="换一个 storageKey 就持久化到自己的 localStorage 项；同页面的开关仍会实时互相同步。"
        >
          <ThemeSwitch storageKey="hammer-theme" />
          <ThemeProbe>写入 localStorage.hammer-theme</ThemeProbe>
        </DemoCard>

        <DemoCard
          title="保留过渡 · disableTransitionOnChange"
          description="默认 true：切换瞬间关掉 CSS 过渡，避免整页颜色拖影；设为 false 则平滑过渡。"
        >
          <ThemeSwitch disableTransitionOnChange={false} />
          <ThemeProbe>切换时颜色平滑过渡</ThemeProbe>
        </DemoCard>
      </div>
    </div>
  );
}

export default ThemeSwitchOptions;
