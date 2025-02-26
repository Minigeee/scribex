import { useMediaQuery } from 'usehooks-ts';

const _breakpoints = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
};

/** Responsive design media query */
export function useBreakpoint(breakpoint: keyof typeof _breakpoints) {
  return useMediaQuery(_breakpoints[breakpoint]);
}
