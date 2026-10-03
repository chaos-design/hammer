import type { Language } from '@docs/utils/i18n';
import { uiStrings } from '@docs/utils/locales';
import { cn } from '@docs/utils/utils';

export type LastModifiedProps = {
  /**
   * The last modified timestamp in milliseconds
   */
  lastModified: number;
  /**
   * Language of the surrounding page. Picks both the label and the date
   * format, so an English page never renders a Chinese timestamp.
   */
  language?: Language;
  className?: string;
};

export function LastModified({
  lastModified,
  language = 'zh',
  className,
}: LastModifiedProps) {
  const { lastModified: label, dateLocale, timeZone } = uiStrings[language];
  const formattedDate = new Date(lastModified).toLocaleString(dateLocale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone,
  });

  return (
    <p className={cn('text-foreground/70 text-sm', className)}>
      {label}
      {formattedDate}
    </p>
  );
}
