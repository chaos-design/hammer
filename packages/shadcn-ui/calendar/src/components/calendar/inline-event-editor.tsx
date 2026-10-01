'use client';
import type { Locale as DateFnsLocale } from 'date-fns';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../../components/ui/button';
import type {
  CalendarCategory,
  CalendarEvent,
  CalendarStrings,
  EventEditorValues,
  InlineEditorState,
  UiLocale,
  WeekStart,
} from '../../types';
import { cn } from '../../utils';
import { formatDateForLocale } from '../../utils/calendar-logic';
import { EventEditorForm } from './event-editor-form';

interface InlineEditorProps {
  className?: string;
  state: InlineEditorState | null;
  categories?: CalendarCategory[];
  strings: CalendarStrings;
  locale: UiLocale;
  dateFnsLocale: DateFnsLocale;
  weekStart: WeekStart;
  accentColorClass: string;
  onClose: () => void;
  onSubmit: (values: EventEditorValues, existing?: CalendarEvent) => void;
  onDelete: (id: string) => void;
}

export function InlineEventEditor(props: InlineEditorProps) {
  const {
    className,
    state,
    categories,
    strings,
    locale,
    dateFnsLocale,
    weekStart,
    accentColorClass,
    onClose,
    onSubmit,
    onDelete,
  } = props;

  const editorRef = React.useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  const anchorEl = state?.anchorEl;
  const anchorOffset = state?.anchorOffset;

  const updatePosition = React.useCallback(() => {
    if (typeof window === 'undefined') return;
    if (!anchorEl || !editorRef.current || !anchorOffset) return;

    const anchorRect = anchorEl.getBoundingClientRect();
    const editorHeight = editorRef.current.offsetHeight || 0;
    const editorWidth = editorRef.current.offsetWidth || 0;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const offset = 8;

    const clickX = anchorRect.left + anchorOffset.x;
    const clickY = anchorRect.top + anchorOffset.y;

    let top = clickY + offset;
    if (anchorRect.bottom + offset + editorHeight > viewportHeight) {
      top = clickY - editorHeight - offset;
    }

    let left = clickX + offset;

    const minTop = 8;
    const maxTop = Math.max(minTop, viewportHeight - editorHeight - 8);
    const minLeft = 8;
    const maxLeft = Math.max(minLeft, viewportWidth - editorWidth - 8);

    if (!Number.isNaN(top)) {
      top = Math.min(Math.max(top, minTop), maxTop);
    }
    if (!Number.isNaN(left)) {
      left = Math.min(Math.max(left, minLeft), maxLeft);
    }

    setPosition({ top, left });
  }, [anchorEl, anchorOffset]);

  useEffect(() => {
    if (!state?.open || !anchorEl) return;
    if (typeof window === 'undefined') return;

    let frame: number | null = null;

    const handle = () => {
      if (frame != null) {
        window.cancelAnimationFrame(frame);
      }
      frame = window.requestAnimationFrame(updatePosition);
    };

    handle();
    window.addEventListener('scroll', handle, true);
    window.addEventListener('resize', handle);

    return () => {
      if (frame != null) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener('scroll', handle, true);
      window.removeEventListener('resize', handle);
    };
  }, [state?.open, anchorEl, updatePosition]);

  useEffect(() => {
    if (!state?.open) return;
    if (typeof window === 'undefined') return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!editorRef.current) return;
      const target = event.target as Node | null;
      if (target && editorRef.current.contains(target)) {
        return;
      }

      const path =
        typeof event.composedPath === 'function' ? event.composedPath() : [];
      if (
        Array.isArray(path) &&
        path.some(
          (node) =>
            node instanceof HTMLElement &&
            (node.hasAttribute('data-inline-editor-popup') ||
              node.hasAttribute('data-radix-select-content') ||
              node.hasAttribute('data-radix-select-viewport') ||
              node.hasAttribute('data-radix-popper-content-wrapper') ||
              node.getAttribute('role') === 'listbox'),
        )
      ) {
        return;
      }

      onClose();
    };

    window.addEventListener('pointerdown', handlePointerDown, true);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown, true);
    };
  }, [state?.open, onClose]);

  if (!state || !state.open) return null;

  const { mode, start, end, event } = state;

  const handleSubmit = (values: EventEditorValues) => {
    onSubmit(values, event);
    onClose();
  };

  const handleDelete = () => {
    if (event) {
      onDelete(event.id);
      onClose();
    }
  };

  // Portal so the editor floats over the grid
  const content = (
    <div className="fixed inset-0 z-40 pointer-events-none">
      <div
        ref={editorRef}
        className={cn(
          'pointer-events-auto absolute w-[320px] max-w-[90vw] rounded-lg border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-900',
          className,
        )}
        style={{ top: position.top, left: position.left }}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
              {mode === 'create'
                ? strings.inlineNewEventTitle
                : strings.inlineEventDetailsTitle}
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              {locale === 'zh'
                ? `${formatDateForLocale(start, locale, dateFnsLocale)} ${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`
                : `${format(start, 'eee, MMM d, HH:mm', { locale: dateFnsLocale })} - ${format(end, 'HH:mm', { locale: dateFnsLocale })}`}
            </p>
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={onClose}
          >
            ×
          </Button>
        </div>
        <EventEditorForm
          mode={mode}
          initialTitle={event?.title}
          initialDescription={event?.description}
          initialStart={start}
          initialEnd={end}
          initialAllDay={event?.allDay}
          initialCategory={event?.category}
          initialColor={event?.color}
          categories={categories}
          weekStart={weekStart}
          locale={locale}
          strings={strings}
          dateFnsLocale={dateFnsLocale}
          defaultColorClass={accentColorClass}
          onSubmit={handleSubmit}
          onCancel={onClose}
          onDelete={mode === 'edit' ? handleDelete : undefined}
        />
      </div>
    </div>
  );

  if (typeof document === 'undefined') return content;

  return createPortal(content, document.body);
}
