export interface ThemeConfig {
  accent: 'sky' | 'emerald' | 'purple' | 'amber' | 'rose'
  weekendTint: 'mild' | 'medium' | 'strong'
  otherMonthOpacity: number
  eventRadius: 'sm' | 'md' | 'lg'
  gridLines: 'solid' | 'dashed'
  // View-specific options
  dayViewFullWidth: boolean
  weekOverlapAlternateOpacity: boolean
  weekSummaryEnabled: boolean
  moreCountThreshold: number
  monthMorePopoverEnabled: boolean
  yearViewEnabled: boolean
}

export const DEFAULT_THEME: ThemeConfig = {
  accent: 'sky',
  weekendTint: 'medium',
  otherMonthOpacity: 0.6,
  eventRadius: 'md',
  gridLines: 'dashed',
  dayViewFullWidth: true,
  weekOverlapAlternateOpacity: true,
  weekSummaryEnabled: true,
  moreCountThreshold: 3,
  monthMorePopoverEnabled: true,
  yearViewEnabled: true,
}
