# Workspace Guidelines
- **Local Development Only (Do NOT Push):** All development must be done locally. Do not run `git push` or upload code to the remote GitHub repository unless explicitly requested by the user after they have verified the changes.

# UI & Theming Guidelines
- **Strict Theme Variable Usage:** Never hardcode colors (e.g., `bg-[#161618]`) when global theme variables exist. Always respect the project's global CSS theme variables (e.g., `bg-background`, `text-foreground`).
- **No Conflicting Tailwind Classes:** Never apply multiple conflicting base background or text classes to the same element (e.g., do not combine `bg-slate-50` and `bg-zinc-900`).
- **Light/Dark Mode Compliance:** All UI components must be explicitly designed and verified to support both Light and Dark mode simultaneously. Use proper theme prefixing (e.g., `.light_&` or `dark:`) depending on the workspace configuration, and never assume a single fixed theme.
