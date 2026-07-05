# Workspace Guidelines
- **Local Development Only (Do NOT Push):** All development must be done locally. Do not run `git push` or upload code to the remote GitHub repository unless explicitly requested by the user after they have verified the changes.

# UI & Theming Guidelines
- **Strict Theme Variable Usage:** Never hardcode colors (e.g., `bg-[#161618]`) when global theme variables exist. Always respect the project's global CSS theme variables (e.g., `bg-background`, `text-foreground`).
- **No Conflicting Tailwind Classes:** Never apply multiple conflicting base background or text classes to the same element (e.g., do not combine `bg-slate-50` and `bg-zinc-900`).
- **Light/Dark Mode Compliance:** All UI components must be explicitly designed and verified to support both Light and Dark mode simultaneously. **This workspace uses the standard `dark:` prefix for dark mode.** NEVER write dark-theme colors (like `text-white`, `bg-zinc-900`, or `hover:text-white`) as base classes. Always write base classes for Light Mode (e.g. `text-slate-500 hover:text-slate-900`), and explicitly use the `dark:` prefix for Dark Mode overrides (e.g. `dark:text-zinc-400 dark:hover:text-white`) to prevent invisible text in light mode.

# Resiliency Guidelines
- **State Management & Promises:** When interacting with client-side stores or local storage functions in React components (e.g. getAllLeads()), safely handle potentially synchronous returns by wrapping them in Promise.resolve(). This ensures .then() chains do not crash the component silently if the store function is refactored from asynchronous to synchronous.
