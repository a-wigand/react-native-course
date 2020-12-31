import produce from 'immer';

import defaultTheme from './default';

/**
 * New flavor theme extends the default theme
 */
const theme = produce(defaultTheme, draft => {
  draft.palette.primary = '#2b762c';
  draft.palette.secondary = '#5dfc5f';
});

export default theme;
