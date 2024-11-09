import type { IConfigOption, Theme } from '@/types';
import DEFAULT_THEME from '@/assets/themes/default.css?raw';
import GRACE_THEME from '@/assets/themes/grace.css?raw';
import ORANGE_THEME from '@/assets/themes/orange.css?raw';
import ORANGESHADOW_THEME from '@/assets/themes/orange_shadow.css?raw';
import RECTANGLE_THEME from '@/assets/themes/rectangle.css?raw';
import SHADOW_THEME from '@/assets/themes/shadow.css?raw';

import { toMerged } from 'es-toolkit';

export const defaultCssThemes = [
  {
    label: `默认主题`,
    desc: `default`,
    value: DEFAULT_THEME,
  },
  {
    label: `优雅`,
    desc: `grace`,
    value: GRACE_THEME,
  },
  {
    label: `重影`,
    desc: `shadow`,
    value: SHADOW_THEME,
  },
  {
    label: `方框`,
    desc: `rectangle`,
    value: RECTANGLE_THEME,
  },
  {
    label: `橘影`,
    desc: `orangeShadow`,
    value: ORANGESHADOW_THEME,
  },
  {
    label: `橘子`,
    desc: `orange`,
    value: ORANGE_THEME,
  },
];
