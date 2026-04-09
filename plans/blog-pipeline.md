# Plan: BlogPipeline

> Source PRD: [#48 — Deepen blog content pipeline into a single BlogPipeline module](https://github.com/M-Kolacz/michalkolacz.com/issues/48)

## Architectural decisions

Durable decisions that apply across all phases:

- **Public API**: `createBlogPipeline(source?)` factory + `getBlog()` singleton accessor. Three methods: `getListings()`, `getPost(slug)`, `invalidate(slug?)`
- **Content source interface**: `BlogContentSource` with `getSlugs()`, `getContent(slug)`, `getImageUrl(slug, imagePath)` — the minimal injection seam
- **Singleton pattern**: `@epic-web/remember` inside `getBlog()` to survive HMR
- **Schema**: `BlogPostFrontmatterSchema` stays in its own file — pure validation type, not part of the module to deepen
- **Cache strategy**: LRU + cachified, listings 5min TTL + 1hr SWR, posts 1hr TTL + 1day SWR — all internal
- **Compilation queue**: Concurrency-limited to 2, internal detail
- **Output contract**: All dates are ISO strings, all image URLs are fully resolved. No `Date` objects cross the module boundary.

---

## Phase 1: BlogContentSource interface + GitHub adapter

> [#49](https://github.com/M-Kolacz/michalkolacz.com/issues/49)

**User stories**: US3, US13

### What to build

Extract the GitHub dependency into a `BlogContentSource` interface and build `createGitHubContentSource()` that wraps the existing Octokit logic. This is the injection seam the rest of the pipeline depends on. Existing code continues to call old functions — wiring happens in later phases.

### Tests

- MSW tests for the GitHub adapter: listing slugs, fetching content, constructing image URLs

### Acceptance criteria

- [ ] `BlogContentSource` interface defined with exactly 3 methods
- [ ] `createGitHubContentSource()` wraps existing Octokit logic and satisfies the interface
- [ ] MSW tests verify the GitHub adapter
- [ ] Existing blog functionality unaffected

---

## Phase 2: Core pipeline with `getPost(slug)`

> [#50](https://github.com/M-Kolacz/michalkolacz.com/issues/50)

**User stories**: US1, US2, US5, US6, US10, US11 (post path)

### What to build

Create `createBlogPipeline(source)` and `getBlog()` with `getPost(slug)`. Consolidates MDX compilation (unified plugin config), frontmatter validation (throw on invalid), image URL resolution, date serialization, caching, and compilation queue. Wire `blog.$slug.tsx` loader — it becomes a one-liner.

### Tests

Boundary tests with fake source: valid post returns compiled MDX with correct data, invalid frontmatter throws, non-existent slug throws. Remove `mdx.server.test.ts`.

### Acceptance criteria

- [ ] `createBlogPipeline(source)` factory exists
- [ ] `getBlog()` returns singleton via `@epic-web/remember`
- [ ] `getPost(slug)` returns compiled MDX, validated frontmatter (ISO dates), reading time, resolved image URLs
- [ ] `getPost(slug)` throws on invalid frontmatter or non-existent slug
- [ ] `blog.$slug.tsx` loader uses `getBlog().getPost(slug)` with no manual image/date handling
- [ ] Remark/rehype plugin config in one place
- [ ] Boundary tests pass; `mdx.server.test.ts` removed

---

## Phase 3: `getListings()` through the pipeline

> [#51](https://github.com/M-Kolacz/michalkolacz.com/issues/51)

**User stories**: US1, US4, US11 (listing path), US12

### What to build

Add `getListings()` to the pipeline. Lightweight compilation (remark-only). Silently filters invalid frontmatter and unpublished posts. Output has resolved image URLs and ISO dates. Wire `blog._index.tsx` and `blog.rss[.]xml.ts` loaders.

### Tests

Boundary tests: sorted by date, filters invalid frontmatter silently, filters unpublished, resolved image URLs, ISO dates. Remove `cache.server.test.ts`.

### Acceptance criteria

- [ ] `getListings()` returns published posts sorted by date descending
- [ ] Invalid frontmatter silently filtered, unpublished excluded
- [ ] Image URLs resolved, dates are ISO strings
- [ ] Both route loaders wired to `getBlog().getListings()`
- [ ] Boundary tests pass; `cache.server.test.ts` removed

---

## Phase 4: `invalidate()` and cache encapsulation

> [#52](https://github.com/M-Kolacz/michalkolacz.com/issues/52)

**User stories**: US7, US8, US9

### What to build

Add `invalidate(slug?)` to the pipeline. Stop exporting `blogLruCache` and `compilationQueue`. All cache internals become private to the module.

### Tests

Boundary tests: `invalidate(slug)` causes recompilation, `invalidate()` causes refetch.

### Acceptance criteria

- [ ] `invalidate(slug)` clears specific post cache
- [ ] `invalidate()` clears listings cache
- [ ] `blogLruCache` and `compilationQueue` no longer exported
- [ ] All cache internals private
- [ ] Boundary tests verify invalidation
