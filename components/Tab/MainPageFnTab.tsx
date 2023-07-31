import { rem, Tabs, TabsProps } from '@mantine/core';

export default function MainPageFnTab(props: TabsProps) {
  return (
    <Tabs
      unstyled
      styles={(theme) => ({
        tab: {
          ...theme.fn.focusStyles(),
          // backgroundColor: '#172e48',
          // color: theme.colors.gray[2],
          // border: `${rem(1)} solid #172e48`,
          borderTopLeftRadius: theme.radius.sm,
          borderTopRightRadius: theme.radius.sm,
          padding: `${theme.spacing.xs} ${theme.spacing.md}`,
          cursor: 'pointer',
          fontSize: theme.fontSizes.sm,
          display: 'flex',
          alignItems: 'center',

          '&:disabled': {
            opacity: 0.5,
            cursor: 'not-allowed',
          },

          '&:not(:first-of-type)': {
            borderLeft: 0,
          },

          '&[data-active]': {
            backgroundColor: theme.colors.gray[7],
            borderColor: 'rgba(241, 245, 249, 0.05)',
            color: theme.white,
          },
        },

        tabIcon: {
          marginRight: theme.spacing.xs,
          display: 'flex',
          alignItems: 'center',
        },

        tabsList: {
          display: 'flex',
        },

        panel: {
          display: 'flex',
          flexDirection: 'column',
        },
      })}
      {...props}
    />
  );
}
