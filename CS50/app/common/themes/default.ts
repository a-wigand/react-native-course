import * as Colors from '../styles/colors';
import * as Fonts from '../styles/fonts';
import * as Layout from '../styles/layout';

const theme = {
  // Color
  palette: {
    common: {
      black: Colors.black,
      darkGray: Colors.darkGray,
    },
    gradient: {
      start: Colors.gradientStart,
      end: Colors.gradientEnd,
    },
    primary: Colors.colorPrimary,
    secondary: Colors.colorSecondary,
  },

  // Font
  fontSizeSmall: Fonts.fontSizeSmall,
  fontSizeMedium: Fonts.fontSizeMedium,
  fontSizeLarge: Fonts.fontSizeLarge,
  fontWeightLight: Fonts.fontWeightLight,
  fontWeightMedium: Fonts.fontWeightMedium,
  fontWeightHeavy: Fonts.fontWeightHeavy,

  // Layout
  borderRadiusSmall: Layout.borderRadiusSmall,
  borderRadiusMedium: Layout.borderRadiusMedium,
  paddingMedium: Layout.paddingMedium,
  paddingLarge: Layout.paddingLarge,
  marginMedium: Layout.marginMedium,
  marginLarge: Layout.marginLarge,
};

export default theme;
