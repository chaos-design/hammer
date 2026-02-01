import { cn } from '@docs/utils/utils';

export type LastModifiedProps = {
  /**
   * The last modified timestamp in milliseconds
   */
  lastModified: number;
  className?: string;
};

export function LastModified({ lastModified, className }: LastModifiedProps) {
  const date = new Date(lastModified);
  // const formattedDate = date.toLocaleDateString('en-US', {
  //   year: 'numeric',
  //   month: 'long',
  //   day: 'numeric',
  // })
  const formattedDate = date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Shanghai',
  });

  return (
    <p className={cn('text-foreground/70 text-sm', className)}>
      最后更新：{formattedDate}
    </p>
  );
}
