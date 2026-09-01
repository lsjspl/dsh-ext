# dsh-plugin-dev-tool-ext

Eight developer-experience features for the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness), in one plugin. Every feature has its own switch in **Settings → Dev Tools**, and a switched-off feature registers nothing at all — no route, no listener, no slot entry.

```sh
dsh plugin --profile web add dsh-plugin-dev-tool-ext
```

Then add it to the profile's bundle list (`$DSH_HOME/profiles/web/package.json`):

```json
{ "dsh": { "profile": { "bundles": ["@deepseek-ai/dsh-base", "@deepseek-ai/dsh-web-app", "dsh-plugin-dev-tool-ext"] } } }
```

Restart the harness. Everything below is on by default except command review, which asks for a reviewer model first.

## What you get

| Feature | Where it appears |
|---|---|
| **Composer images** — a picker button, and drag-to-reorder for draft images | The composer's image rail and tool row |
| **Reasoning effort for third-party providers** — declare each model's effort levels | Settings → Dev Tools; the levels then appear in the composer's own effort control |
| **DeepSeek balance** — the official API account balance | Settings → Dev Tools, plus an optional session-header chip |
| **Command review** — a second model judges high-risk tool calls | Runs in the tool pipeline; verdicts are listed in Settings |
| **Project explorer** — directory tree and uncommitted changes | A collapsible panel above the composer |
| **Session records** — delete sessions, with a restorable trash | Settings → Dev Tools |
| **Plugin safety** — quarantine a plugin, and rescue a harness that will not boot | Settings → Dev Tools, plus the `dsh-ext` command |
| **Checkpoints** — per-session rollback of the agent's file changes | Settings → Dev Tools |

## The two features with sharp edges

Most of this plugin is ordinary chrome. Two features touch things that are expensive to get wrong, so here is exactly what they do.

### Checkpoints never touch your git

Rollback works through a **shadow repository** that lives in `$DSH_HOME/dsh-dev-tool-ext/checkpoints/`, not in your project. Three invariants hold for every git command this plugin runs:

1. `GIT_DIR` points at the shadow repository, never `<project>/.git`.
2. `GIT_INDEX_FILE` points there too — without it a `git add` would stage *your* files as a side effect.
3. `.git/` is excluded from every snapshot, so your history is never copied into the shadow repo.

`npm run verify:checkpoints` proves this on a throwaway repository: it fingerprints `HEAD`, the commit graph, `git status`, the reflog, the stash list, the branch list, the staged index content, and the raw `.git/index` bytes before and after a full snapshot → restore → undo cycle, and fails on any difference. Your commits, index, stashes, and branches come out byte-identical.

A restore is also **not a one-way door**: it snapshots the current state first and commits the restored state *forward* rather than rewinding the shadow branch, so checkpoints taken after the one you restored stay reachable and the restore itself can be undone.

What a restore *can* lose is a working-tree file your own git does not track — that is the one case where the working copy is the only copy. The confirmation dialog lists those paths separately and counts them, because it is the only part of the operation that is not recoverable from somewhere else.

**What is not checkpointed.** The shadow repository reads your project's `.gitignore` files, so an ignored path is not snapshotted and a rollback will not restore it. This is the difference between a snapshot that takes about a second and one that never finishes: without it, every checkpoint would stage `node_modules` in full. Ignored paths are overwhelmingly build output, caches, and secrets, so the trade is usually invisible — but if the agent edits a gitignored file, that edit is outside the rollback. The plugin's own `excludes` setting covers projects with no `.gitignore` at all.

### Plugin safety, when the harness will not start

A plugin cannot rescue a harness it is composed into: if a third-party plugin throws during boot, the whole tree fails and this plugin's settings page is just as unreachable as everything else. So the feature has two halves, and the important one runs outside the harness:

```sh
npx dsh-plugin-dev-tool-ext dsh-ext safe            # start without any third-party plugin
npx dsh-plugin-dev-tool-ext dsh-ext skip <plugin>   # skip exactly one
npx dsh-plugin-dev-tool-ext dsh-ext list            # what is installed, and what is quarantined
npx dsh-plugin-dev-tool-ext dsh-ext uninstall <plugin>
npx dsh-plugin-dev-tool-ext dsh-ext restore         # re-enable everything
```

`dsh-ext` imports nothing — not from the harness, not from npm — and is shipped as plain `.mjs` rather than bundled, so it still runs when this package's own build output is broken.

Both halves write disable rows into `$DSH_HOME/cordis.patch.yml`, which the launcher composes **after** every bundle layer and after the profile's own layer. That ordering is what makes it work: a disable row there outranks whatever enabled the plugin, and nothing of ours needs to have loaded. Start the harness normally afterwards — no flags.

Your own entries in that file are preserved. Only the region between the two `dsh-dev-tool-ext: quarantine` markers is ever rewritten, and the first write leaves a `.bak-dsh-ext` copy.

## Command review

Screens tool calls against local patterns, then asks a model to judge the ones that match:

```yaml
dsh-dev-tool-ext:
  commandReview:
    enabled: true
    mode: rules+llm        # rules-only | rules+llm | all
    provider: deepseek-official
    model: deepseek-v4-flash
    onFailure: ask         # ask | deny | allow
```

Two properties are worth stating plainly:

- **A review can only make a call stricter.** On `allow` the listener delegates to the rest of the pipeline rather than claiming the decision, so it can never turn a call the harness would refuse into one it permits.
- **A reviewer failure cannot silently widen permission.** A timeout, a missing credential, an unparseable answer — all take the `onFailure` path, whose default is `ask`.

`ask` is routed through the harness's own approval service, so escalating to you costs no bespoke UI. Every verdict is logged with its reason and which stage produced it, because a review that silently denied a call would leave you with an agent that mysteriously cannot work.

Reasoning-effort declarations are written to the pi-ai adapter's own per-model `reasoningEfforts` field, under `modelOverrides` — never the `models` array, because any entry there *replaces* the route's built-in catalog.

## Configuration

Everything is under the `dsh-dev-tool-ext` settings namespace and editable from the settings page. `$DSH_HOME/settings.yaml` holds the same keys if you prefer a file:

```yaml
dsh-dev-tool-ext:
  imageComposer:   { enabled: true, pickerButton: true, dragReorder: true }
  reasoningEffort: { enabled: true }
  deepseekBalance: { enabled: true, cacheTtlSeconds: 60, headerBadge: false }
  commandReview:   { enabled: false, mode: rules+llm, onFailure: ask }
  explorer:        { enabled: true, side: right, defaultOpen: false, respectGitignore: true }
  sessionAdmin:    { enabled: true, trashEnabled: true, attachmentGc: false }
  pluginSafety:    { enabled: true, quarantine: [] }
  checkpoints:     { enabled: true, snapshotOn: turn, retentionDays: 30, maxFileSizeMb: 32 }
```

## Notes and limits

- **Requirements.** `webServer` is the only hard dependency. Everything else is resolved optionally at mount time, so a composition without (say) an approval service loses one feature rather than failing to load the plugin. A feature that throws while mounting is logged and skipped — it cannot take the plugin, let alone the harness, down.
- **git.** The explorer and checkpoints need `git` on `PATH`. Without it the explorer still lists files and checkpoints report themselves unavailable.
- **Session deletion** needs a backend that stores one file per session (the shipped JSONL one does). It reports the limitation rather than offering a button that would fail. Deleted sessions may stay in the sidebar until reload — the harness holds that list in memory.
- **The DeepSeek API key** is read on the host and never sent to the browser; the page is told only where the key came from.
- **Reasoning effort** currently targets `llm-pi-ai` routes, which is the adapter family third-party providers are configured through.

## Development

```sh
pnpm install
npm run verify      # typecheck, parser suite, and the git-isolation proof
npm run build
```

MIT.
