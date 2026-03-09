# Reveal SDK Integration

Reveal SDK is a companion product for embedding interactive BI dashboards and data visualizations inside your React application. It uses separate packages and requires a backend Reveal server URL.

## Install Reveal SDK

```bash
npm install reveal-sdk-wrappers-react reveal-sdk-wrappers
```

> **Note:** `reveal-sdk-wrappers-react` provides the React component (`RvRevealView`), while `reveal-sdk-wrappers` provides the options and configuration types (`RevealViewOptions`).
>
> The Reveal SDK exposes its API through the `$.ig` global namespace. If TypeScript reports that `$` is not defined, add a declaration at the top of your file:
> ```tsx
> declare const $: any;
> ```

## Basic Usage

```tsx
import { RvRevealView } from 'reveal-sdk-wrappers-react';
import { RevealViewOptions } from 'reveal-sdk-wrappers';

declare const $: any;

function DashboardView() {
  // Set the Reveal SDK backend URL (required)
  $.ig.RevealSdkSettings.setBaseUrl('https://your-reveal-server/reveal-api/');

  const options: RevealViewOptions = {
    visualizations: {
      menu: {
        copy: false,
        duplicate: false
      }
    }
  };

  return <RvRevealView options={options} />;
}
```

## Syncing Reveal Theme with Ignite UI Theme

When using Reveal SDK alongside Ignite UI components, sync the Reveal theme with Ignite UI's CSS custom properties so both share the same visual style. Call `setRevealTheme()` at component initialization:

```tsx
import { RvRevealView } from 'reveal-sdk-wrappers-react';
import { RevealViewOptions } from 'reveal-sdk-wrappers';

declare const $: any;

export default function DashboardView() {
  const options: RevealViewOptions = {
    visualizations: {
      menu: {
        copy: false,
        duplicate: false
      }
    }
  };

  $.ig.RevealSdkSettings.setBaseUrl('https://your-reveal-server/reveal-api/');
  setRevealTheme();

  function setRevealTheme() {
    const style = window.getComputedStyle(document.body);
    const theme = new $.ig.RevealTheme();

    // Sync font with Ignite UI's --ig-font-family token
    theme.regularFont = style.getPropertyValue('--ig-font-family')?.trim() || 'sans-serif';
    theme.mediumFont = theme.regularFont;
    theme.boldFont = theme.regularFont;

    // Auto-detect light/dark mode from the surface color brightness
    const color = style.getPropertyValue('--ig-surface-500').trim() || '#fff';
    const [r, g, b] = [1, 3, 5].map(i => parseInt(color.substring(i, i + 2), 16));
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    theme.isDark = brightness < 128;
    theme.fontColor = theme.isDark ? 'white' : 'black';

    // Sync background colors with Ignite UI palette tokens
    theme.dashboardBackgroundColor = style.getPropertyValue('--ig-gray-100').trim();
    theme.visualizationBackgroundColor = style.getPropertyValue('--ig-surface-500').trim();

    $.ig.RevealSdkSettings.theme = theme;
  }

  return <RvRevealView options={options} />;
}
```

## Token Mapping Reference

| Reveal Theme Property | Ignite UI CSS Token | Purpose |
|---|---|---|
| `regularFont`, `mediumFont`, `boldFont` | `--ig-font-family` | Font family |
| `isDark` | Computed from `--ig-surface-500` brightness | Light/dark mode detection |
| `fontColor` | Derived from `isDark` | Text color (white for dark, black for light) |
| `dashboardBackgroundColor` | `--ig-gray-100` | Dashboard background |
| `visualizationBackgroundColor` | `--ig-surface-500` | Individual visualization card background |

> **Tip:** When switching between light and dark Ignite UI themes, call `setRevealTheme()` again after the theme change so Reveal dashboards stay in sync.

See the [customize-theme skill](../../igniteui-react-customize-theme/SKILL.md) for more details on Ignite UI CSS custom properties and theme switching.
