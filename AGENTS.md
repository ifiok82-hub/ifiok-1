<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Marketplace management uses authenticated server functions and database-enforced admin roles; browser state never grants privileges.
- Genuine seller submissions and demo catalogue records are stored separately; legacy seeded listings are retained but excluded from live stock.
- Administrative mutations use an audited database RPC so the action and audit record commit together.
- Pi payments and legacy escrow release endpoints fail closed until end-to-end payment and custody verification is implemented.
- First-admin provisioning requires a verified account matching a server-only INITIAL_ADMIN_EMAIL and an atomic one-time role assignment.
- Homepage search and category filters share the pure marketplace-filters helper; filtering never adds stock or changes listing eligibility.
