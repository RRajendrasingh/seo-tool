<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Workspace Guidelines
- **Local Development Only (Do NOT Push):** All development must be done locally. Do not run `git push` or upload code to the remote GitHub repository unless explicitly requested by the user after they have verified the changes.
- **Trailing Slash Enforced:** All internal links (`href`), client-side redirections (`router.push()`), and navigation item directories must strictly include a trailing slash (e.g. use `/news/` instead of `/news`, `/audit/` instead of `/audit`). No paths should be linked without a trailing slash.
- **Repository Cleanliness:** Keep the `tests/` folder (integration tests) in the repository. Keep temporary debug files (like database counts, scratch files, or test scripts outside the `tests/` directory) local or clean them up before pushing, preventing repository clutter.
