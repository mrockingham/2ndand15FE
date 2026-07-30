# Design System Direction

## Experience direction

2nd and 15 should feel like a premium game-day broadcast translated into a responsive product: deep spatial layers, decisive score typography, field-inspired detail, and electric highlights. The system should remain calm enough for dense data and accessible in both dark and light modes.

This document defines direction and token roles. Exact visual values should be tuned during the foundation milestone and verified in the browser before being treated as final.

## Design principles

- Information hierarchy before decoration.
- Cinematic depth without sacrificing legibility or speed.
- One clear electric accent rather than many competing brand colors.
- Motion communicates state and continuity; it does not decorate every interaction.
- Mobile layouts are intentional compositions, not compressed desktop screens.
- NFL identity comes from product craft and approved data, never copied/unlicensed assets.

## Color roles

Use semantic theme tokens so components work in both modes.

| Role             | Dark direction                      | Light direction           | Use                             |
| ---------------- | ----------------------------------- | ------------------------- | ------------------------------- |
| Canvas           | Near-black navy                     | Soft cool neutral         | App background                  |
| Surface          | Deep navy                           | White                     | Cards and panels                |
| Elevated surface | Lighter blue-black                  | Cool off-white            | Menus, dialogs, featured panels |
| Primary text     | Near-white                          | Ink navy                  | Main content                    |
| Secondary text   | Cool gray                           | Slate                     | Supporting metadata             |
| Accent           | Electric cyan/blue                  | Saturated accessible blue | Actions, focus, selected state  |
| Positive         | Accessible green                    | Accessible green          | Confirmed success/win state     |
| Warning          | Warm amber                          | Darker amber              | Caution/delayed state           |
| Critical         | Bright red with sufficient contrast | Darker red                | Errors/destructive actions      |
| Divider          | Translucent cool border             | Pale slate border         | Grouping and boundaries         |

Never use status color as the only carrier of meaning. Team colors may be used as restrained supplemental accents only when supplied by an approved source and when contrast remains valid.

## Typography

- Use a robust sans-serif UI family that can be delivered legally and efficiently; prefer a system fallback stack until a font is approved.
- Scores and high-impact numeric displays use bold or black weight, tabular numbers, compact line height, and responsive sizing.
- Headings are concise and strong; body copy remains comfortable at small screen sizes.
- Metadata uses size and tone carefully but must remain readable at 200% zoom.
- Do not use condensed display text for long-form or form content.

Define typography through MUI theme variants rather than arbitrary per-component font values. Add dedicated semantic variants for score, overline/status, and compact metadata only if TypeScript theme augmentation is maintained.

## Shape, spacing, and elevation

- Use the MUI spacing scale as the base rhythm, with consistent half-step use when necessary.
- Prefer medium-to-large rounded panels, with tighter radii on compact controls and badges.
- Use subtle borders and tonal separation before heavy shadows.
- Featured game panels may use layered gradients or field-line motifs, provided text contrast is protected by an overlay.
- Keep content width constrained on large screens while allowing scores, schedules, and visualizations to use deliberate wide layouts.

## Responsive behavior

Use MUI breakpoints unless evidence requires a project-specific scale.

- Small/mobile: one-column content, touch-friendly controls, safe-area-aware bottom navigation, compact score layouts.
- Medium/tablet: adaptive grids and either compact top navigation or bottom navigation based on tested space, not device detection.
- Large/desktop: persistent top navigation, multi-column dashboard regions, wider visual media.

The mobile bottom navigation and desktop top navigation must not appear simultaneously. Primary bottom-nav destinations should remain limited enough to avoid tiny targets; less frequent destinations can move into a menu.

## Navigation shell

The long-term primary areas are Home, Games, News, Stats, AI Hub, and Fantasy.

- Desktop uses a top app bar with brand, primary navigation, theme control, and account entry.
- Mobile uses a bottom navigation for the most important destinations plus a clear path to remaining areas.
- Signed-out experiences retain public navigation and obvious login/register actions.
- Current location is expressed with text/icon state in addition to color.

## Core component patterns

### Team identity

Every team identity component accepts an approved image URL when available and always has an abbreviation fallback. The fallback uses readable text, a stable neutral/approved color treatment, accessible labeling, and handles image load failure without layout shift.

### Game and score cards

Reserve the strongest number style for scores. Clearly distinguish scheduled, live, final, postponed, delayed, and unavailable states. Include date/time and timezone context where ambiguity is possible. Live state should be textual, not indicated only by a pulsing dot.

### Data panels

Use a consistent panel header, optional action area, loading geometry, empty state, and error recovery. Avoid nested cards when spacing and dividers communicate hierarchy more clearly.

### Forms

Use persistent labels, useful autocomplete attributes, visible validation near the field, and a summary/focus strategy when multiple errors occur. Password flows must not reveal whether an account exists unless that is the backend's deliberate security behavior.

### AI and prediction content

Show an explicit AI label, generation/as-of time when supplied, sources for summarized reporting, and a concise limitations affordance. Confidence and historical accuracy must be named separately and presented with context; neither is a guarantee.

## Motion

- Favor short fades, small position shifts, and layout continuity.
- Use more expressive motion only for moments such as entering the game experience or visualizing a play.
- Avoid perpetual glow, parallax, or pulse on routine data panels.
- Honor `prefers-reduced-motion` by removing nonessential animation and replacing spatial transitions with immediate or subtle opacity changes.
- Never make critical data wait for an entrance animation.

## Accessibility baseline

- Target WCAG 2.2 AA for released flows.
- Maintain visible focus styles with sufficient contrast in both themes.
- Use semantic HTML landmarks and controls before adding ARIA.
- Ensure touch targets and spacing are comfortable on mobile.
- Support keyboard-only navigation, 200% zoom, reflow, screen readers, and reduced motion.
- Announce meaningful async form results without making rapidly updating score regions excessively noisy.
- Provide text alternatives for approved informative imagery; decorative field treatments use empty alt text or CSS backgrounds.

## Theme preference

Support dark and light themes. A system-default option is preferred if it can be expressed clearly. Persist only the theme preference; never couple theme persistence to authentication. Avoid a flash of the wrong theme during startup when feasible.

## Milestone 0 visual interpretations

The supplied conceptual references were interpreted for the shell as follows:

- The desktop home dark reference is the primary composition: a slim header, strong left-aligned statement, and an immersive game-day visual region.
- The light theme preserves hierarchy and geometry while replacing near-black layering with white panels, cool-neutral canvas color, restrained borders, and lighter shadows.
- Purple remains the primary interactive color because it dominates the references; cyan is a secondary electric accent for focus and atmospheric detail.
- The temporary `2nd & 15` wordmark uses a bespoke text-and-number badge made in CSS. No generated team/league mark was extracted from the references.
- The landing visual uses an abstract CSS field and explicitly says that live data is not connected. It does not reproduce the player imagery, team logos, scores, or fictional data in the mockups.
- Desktop navigation shows all six long-term areas. Mobile shows Home, Games, News, and Stats plus a More sheet containing AI Hub and Fantasy, keeping five comfortable navigation targets.
- Display typography uses a legal system font stack, heavy weight, tight tracking, and responsive scaling rather than attempting to identify or copy the mockup font.
- Panels use 14-pixel base rounding, subtle borders, and restrained tonal shadow. Content density is intentionally lower than the feature-rich references because this milestone is only the foundation.
- Motion is currently limited to short component transitions and global reduced-motion protection; richer entrance or visualization motion is deferred.
