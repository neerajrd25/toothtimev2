import { StyleSheet } from 'react-native';

export const colors = {
  primary: '#4A90E2',
  primaryDark: '#357ABD',
  background: '#FFFFFF',
  text: '#333333',
  muted: '#666666',
  border: '#E0E0E0',
  inputBg: '#F8F9FA',
  white: '#FFFFFF',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radii = {
  small: 6,
  default: 12,
  large: 20,
};

export const typography = {
  h1: 28,
  h2: 20,
  body: 16,
  small: 12,
};

export const common = StyleSheet.create({
  // Re-usable input style
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.default,
    padding: spacing.md,
    fontSize: typography.body,
    backgroundColor: colors.inputBg,
    color: colors.text,
  },

  // Primary button
  buttonPrimary: {
    backgroundColor: colors.primary,
    borderRadius: radii.default,
    padding: spacing.md,
    alignItems: 'center',
  },

  buttonPrimaryText: {
    color: colors.white,
    fontSize: typography.body,
    fontWeight: '600',
  },

  // Secondary (outlined) button
  buttonOutlined: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.default,
    padding: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.white,
  },

  buttonOutlinedText: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '500',
  },
});

// Small helper for screen-local StyleSheet creation with theme values
export function makeStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  styles: (theme: {
    colors: typeof colors;
    spacing: typeof spacing;
    radii: typeof radii;
    typography: typeof typography;
    common: typeof common;
  }) => T,
) {
  return StyleSheet.create(styles({ colors, spacing, radii, typography, common }));
}

export default {
  colors,
  spacing,
  radii,
  typography,
  common,
  makeStyles,
};