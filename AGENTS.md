# Code Review Rules — admin.residente.mx

## Language
- JSX only (`.jsx` for components, `.js` for hooks/utils). No TypeScript.
- No `var`; use `const`/`let`.

## React
- Functional components only. No class components.
- Hooks: `use` + camelCase naming.
- Prefer named exports for hooks/utils; default exports for components.
- No prop drilling — use Context for shared state.

## Styles
- Tailwind 4 classes only. No inline style objects except Konva-specific layout.
- Follow existing color tokens (`amarillo: #FFF200`).

## Naming
- Components: PascalCase.
- Booleans: `is`/`has`/`es` prefix.
- API functions: verb + entity (e.g. `bannerSceneCreate`).

## Performance
- `React.lazy` + `Suspense` for heavy components (e.g. konva editor).
- No unnecessary re-renders; use `useCallback`/`useMemo` where measurable.

## Comments
- English only. One short line, only when the "why" is non-obvious.

## Commits
- Conventional commits: `feat`, `fix`, `refactor`, `chore`, `docs`.
- Subject ≤ 50 chars. No AI attribution.
