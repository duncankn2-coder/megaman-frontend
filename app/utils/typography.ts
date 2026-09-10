import React from 'react';

export interface TypographyStyle {
  className: string;
  style?: React.CSSProperties;
}

export interface SubtitleTypographyStyle extends TypographyStyle {
  barStyle?: React.CSSProperties;
  barClass?: string;
}

/**
 * Resolves title color into CSS classes or inline style for custom hex colors.
 */
export function resolveTitleColor(
  color?: string | null,
  customColor?: string | null,
  fallbackClass: string = 'text-gray-900'
): TypographyStyle {
  if (color === 'custom' && customColor?.trim()) {
    return { className: '', style: { color: customColor.trim() } };
  }
  switch (color) {
    case 'white':
      return { className: 'text-white' };
    case 'dark':
      return { className: 'text-gray-900' };
    case 'blue':
      return { className: 'text-[#005288]' };
    case 'muted':
      return { className: 'text-gray-500' };
    default:
      return { className: fallbackClass };
  }
}

/**
 * Resolves title font size into Tailwind CSS classes.
 */
export function resolveTitleSize(
  size?: string | null,
  fallbackClass: string = 'text-3xl'
): string {
  switch (size) {
    case 'sm':
      return 'text-2xl';
    case 'md':
      return 'text-3xl';
    case 'lg':
      return 'text-4xl';
    case 'xl':
      return 'text-4xl md:text-5xl';
    case '2xl':
      return 'text-5xl md:text-6xl';
    default:
      return fallbackClass;
  }
}

/**
 * Resolves subtitle color into CSS classes and optional bar background color.
 */
export function resolveSubtitleColor(
  color?: string | null,
  customColor?: string | null,
  fallbackClass: string = 'text-[#005288]'
): SubtitleTypographyStyle {
  if (color === 'custom' && customColor?.trim()) {
    const trimmed = customColor.trim();
    return {
      className: '',
      style: { color: trimmed },
      barStyle: { backgroundColor: trimmed },
    };
  }
  switch (color) {
    case 'white':
      return {
        className: 'text-white',
        barClass: 'bg-white',
        barStyle: { backgroundColor: '#ffffff' },
      };
    case 'dark':
      return {
        className: 'text-gray-900',
        barClass: 'bg-gray-900',
        barStyle: { backgroundColor: '#111827' },
      };
    case 'blue':
      return {
        className: 'text-[#005288]',
        barClass: 'bg-[#005288]',
        barStyle: { backgroundColor: '#005288' },
      };
    case 'muted':
      return {
        className: 'text-gray-500',
        barClass: 'bg-gray-500',
        barStyle: { backgroundColor: '#6b7280' },
      };
    default:
      return {
        className: fallbackClass,
        barClass: 'bg-[#005288]',
        barStyle: undefined,
      };
  }
}

/**
 * Resolves subtitle font size into Tailwind CSS classes.
 */
export function resolveSubtitleSize(
  size?: string | null,
  fallbackClass: string = 'text-[10px]'
): string {
  switch (size) {
    case 'sm':
      return 'text-xs';
    case 'md':
      return 'text-sm';
    case 'lg':
      return 'text-base';
    default:
      return fallbackClass;
  }
}
