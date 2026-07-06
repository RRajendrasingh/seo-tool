# Workspace Guidelines
- **Local Development Only (Do NOT Push):** All development must be done locally. Do not run `git push` or upload code to the remote GitHub repository unless explicitly requested by the user after they have verified the changes.

# UI & Theming Guidelines
- **Strict Theme Variable Usage:** Never hardcode colors (e.g., `bg-[#161618]`) when global theme variables exist. Always respect the project's global CSS theme variables (e.g., `bg-background`, `text-foreground`).
- **No Conflicting Tailwind Classes:** Never apply multiple conflicting base background or text classes to the same element (e.g., do not combine `bg-slate-50` and `bg-zinc-900`).
- **Light/Dark Mode Compliance:** All UI components must be explicitly designed to support both Light and Dark mode. **CRITICAL ARCHITECTURE NOTE:** This workspace is built with **Dark Mode as the default base classes** (e.g., `bg-zinc-950 text-white`). Light Mode is implemented entirely via overrides (e.g. `.light .bg-zinc-950` in `globals.css`). NEVER use the standard `dark:` prefix for dark mode colors, as it conflicts with OS-level media queries when the app is manually toggled to Light mode. To implement Light mode for new components, either add a `.light` override in `globals.css` or use the arbitrary variant `[.light_&]:` in your Tailwind classes (e.g., `text-white [.light_&]:text-slate-900`).
- **Hover State Visibility:** Always explicitly design and verify hover states (`hover:`) in BOTH Light and Dark modes. Ensure text does not disappear when hovered (e.g., white text on a white hover background in light mode). Maintain high contrast for interactive states across both themes.

# Resiliency Guidelines
- **State Management & Promises:** When interacting with client-side stores or local storage functions in React components (e.g. getAllLeads()), safely handle potentially synchronous returns by wrapping them in Promise.resolve(). This ensures .then() chains do not crash the component silently if the store function is refactored from asynchronous to synchronous.
