---
name: daily-dev-typed-client
description: 'Use when implementing or updating calls to the generated daily.dev OpenAPI client in workspaces/shared and backend services. Covers createDailyDevRequestInit overload selection, optional-vs-required data payloads, typed fetch(url, request, true), and status-based json() narrowing from <Id>Response tuple types.'
argument-hint: 'endpoint id + method + call intent'
user-invocable: true
---

# Daily.dev Typed Client Workflow

Use this skill when you need to add, refactor, or review code that consumes the generated daily.dev API client types.

## Source of Truth

- Generated signatures and response tuple types: `workspaces/shared/src/daily-dev-openapi/api.types.ts`
- Generator behavior for typed fetch overloads: `workspaces/shared/bin/build-openapi-client.mts`
- Usage example with status-based narrowing: `workspaces/backend/src/health/heatlh.service.ts`

## Rules You Must Preserve

1. Do not manually edit `api.types.ts`; it is generated.
2. Use `createDailyDevRequestInit(id, method, data?)` with the exact generated `id` and `method` pair.
3. Pass `data` only when the selected overload requires it.
4. Use typed fetch with the third argument set to `true`: `fetch(url, request, true)`.
5. Narrow by `result.status` before reading `result.json()` so JSON is tied to the correct status-specific response type.

## Procedure

1. Locate endpoint overloads in `api.types.ts`.
2. Confirm the endpoint pair:
   - `id`: generated operation identifier.
   - `method`: generated lowercase HTTP verb.
3. Determine whether `data` is required:
   - If overload includes `data: { ... }`, provide only the required keys (`searchParams`, `pathParams`, `body`) with matching generated types.
   - If overload has no `data`, call with only `id` and `method`.
4. Build request init:
   - `const { url, ...request } = createDailyDevRequestInit(id, method, data?)`
5. Execute typed request:
   - `const result = await fetch(url, request, true)`
6. Branch on `result.status` first, then parse:
   - In each handled status case, call `await result.json()` and use the status-specific shape.
   - Handle unexpected statuses with fallback logging/return behavior.
7. Keep runtime behavior explicit:
   - Success branch returns success value.

- Known and unknown error statuses are handled case-by-case per caller (return, map, or throw) and kept explicit.
- Catch blocks should include enough diagnostics to debug request construction.

## Decision Points

- Endpoint has required request data:
  Use the overload with `data` and provide exactly those fields.
- Endpoint has optional/no request data:
  Use the 2-argument overload without a `data` object.
- Endpoint has multiple response statuses in `<Id>Response`:
  Implement a `switch (result.status)` with explicit cases for each relevant status.
- Endpoint may return non-JSON responses:
  Do not call `json()` for statuses/content-types that do not provide JSON.

## Completion Checklist

1. `createDailyDevRequestInit` call compiles with generated overloads.
2. `fetch(url, request, true)` is used (typed mode enabled).
3. Code checks `result.status` before `result.json()`.
4. `result.json()` usage is inside status cases and type-safe.
5. No edits were made directly to generated files.

## Quick Example Pattern

```ts
const { url, ...request } = createDailyDevRequestInit('GetCurrentUserSProfile', 'get')
const result = await fetch(url, request, true)

switch (result.status) {
  case 200: {
    const data = await result.json()
    return data
  }
  case 401:
    return null
  default:
    throw new Error(`Unexpected status: ${result.status}`)
}
```

## Regeneration Note

When OpenAPI definitions change, regenerate the client in shared workspace context so overloads and response mappings stay authoritative.

## API Quick Reference

This snippet of text is obtained from the website: https://docs.daily.dev/public-api/

### Available endpoints

#### Feeds

Access your personalized content streams. Get your "For You" feed tailored to your interests, browse popular posts across the platform, discover content by specific tags or sources, or see what's generating the most discussion in the community.

- Get your personalized "For You" feed
- Browse trending and popular posts
- Filter content by tags or sources
- View most discussed posts

#### Posts

Dive deeper into individual articles. Retrieve full details about any post including its summary, engagement metrics, and metadata. Access the discussion by fetching comments and replies.

- Get detailed information about any post
- Fetch comments and discussions

#### Search

Find exactly what you're looking for. Search across posts to discover articles on specific topics, find tags to follow, or discover new content sources to add to your feed.

- Search posts by keywords
- Find tags matching your query
- Discover content sources

#### Bookmarks

Access your saved content library. Retrieve bookmarks you've saved, search through them, and organize them into folders for easy access later.

- List your saved bookmarks
- Search within your bookmarks
- Manage Bookmark Folders (create, list, delete)
- Add or remove bookmarks programmatically

#### Custom Feeds

Build laser-focused content streams for specific topics or workflows. Create Custom Feeds with specific filters, set engagement thresholds, and configure advanced content settings to surface exactly the content you need.

- List and view your Custom Feeds
- Create new Custom Feeds with specific criteria
- Update or delete existing feeds
- Configure advanced settings like minimum upvotes or view counts

#### Feed filters

Fine-tune what appears in your feeds. Manage the tags, sources, and content types that appear in your personalized or Custom Feeds. Add or remove filters to shape your content experience.

- View current filter settings
- Add tags or sources to follow
- Block unwanted tags or sources
- Apply filters to specific feeds or globally

#### Notifications

Stay on top of your daily.dev activity. Access your notification feed, check unread counts, and mark notifications as read.

- List your notifications
- Get unread notification count
- Mark notifications as read

#### Profile

Access and update your daily.dev profile information programmatically.

- Get your profile details
- Update profile information

#### Experiences

Manage your professional history including work experience, education, projects, certifications, volunteering, and open source contributions.

- List your experiences (filterable by type)
- Get details of a specific experience
- Add new experiences to your profile
- Update existing experiences
- Remove experiences
  Experience Types: work, education, project, certification, volunteering, opensource
