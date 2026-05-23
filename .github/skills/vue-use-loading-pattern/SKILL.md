---
name: vue-use-loading-pattern
description: 'Use when implementing Vue loadable async content (URL/content fetches, API-backed sections, reactive dependency refetch). Enforces useLoading composable usage, forbids destructuring returned fields, and requires explicit .value access in script and template.'
argument-hint: 'component/composable + async content source + dependencies'
user-invocable: true
---

# Vue useLoading Pattern

Use this skill to implement or refactor any Vue async content loading flow so it follows the project convention.

## Outcome

- Async content is managed through `useLoading(callback, computedValues)`.
- The object returned by `useLoading` is stored as a single variable and is not destructured.
- Access to loading/result/error always uses explicit `.value`, including in templates.

## When To Use

- Fetching URL content for rendering
- Loading API-backed sections in a component
- Refetching content when dependencies change
- Replacing ad-hoc loading/error/result refs with the shared composable

## Required Rules

1. Always wrap loadable async content with `useLoading`.
2. Assign composable output to one object variable:
   - `const contentLoading = useLoading(callback, depsCallback)`
3. Do not destructure any returned fields:
   - Disallowed: `const { isLoadingContent, result, error } = useLoading(...)`
4. Use explicit `.value` reads in script expressions:
   - `contentLoading.isLoadingContent.value`
   - `contentLoading.result.value`
   - `contentLoading.error.value`
5. Use explicit `.value` reads in templates:
   - `{{ contentLoading.isLoadingContent.value }}`
   - `{{ contentLoading.result.value }}`

## Procedure

1. Identify the async content operation (fetch function) and dependency source.
2. Create a callback that returns a promise-like result.
3. Create a dependency callback (`computedValues`) that touches every value that should trigger reload.
4. Instantiate the composable once and store it in a single object variable.
5. Replace all direct loading/result/error state references with property access through that object.
6. Ensure no destructuring exists for this composable return value.
7. Verify template bindings use explicit `.value`.

## Decision Points

- Dependencies are static:
  Use a dependency callback that returns a stable sentinel.
- Dependencies are reactive (route params, query, ids, filters):
  Read all of them inside `computedValues` so re-execution is tracked.
- Multiple loadable regions in one component:
  Use separate named objects (for example `contentLoading`, `sidebarLoading`) without destructuring either.

## Completion Checklist

1. `useLoading(...)` is used for each loadable async content region.
2. No destructuring of `useLoading` return object is present.
3. All script reads of loading/result/error use explicit `.value`.
4. All template reads of loading/result/error use explicit `.value`.
5. Dependency callback includes every reactive trigger needed for refetch.

## Example

```ts
const contentLoading = useLoading(fetchContent, () => route.params.slug as string)

if (contentLoading.error.value) {
  logger.error(contentLoading.error.value.message)
}
```

```vue
<template>
  <div v-if="contentLoading.isLoadingContent.value">Loading...</div>
  <article v-else>{{ contentLoading.result.value }}</article>
</template>
```
