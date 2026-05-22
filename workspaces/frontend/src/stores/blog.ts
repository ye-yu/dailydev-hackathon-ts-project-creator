import { computed, ref } from "vue";
import { defineStore } from "pinia";
import type { BlogPostLazy } from "@ye-yu/shared/entities";

export type ViewerTab = "post" | "code";
export type Theme = "light" | "dark";
export type MobileView = "list" | "viewer";

const samplePosts: BlogPostLazy[] = [
  {
    id: "1",
    title: "Getting Started with Vue 3 Composition API",
    dailyDevUrl: "https://dev.to/example/getting-started-with-vue-3-composition-api-1234",
    externalUrl: "https://example.com/blog/vue3-composition-api",
    timestamp: "2026-05-12T09:30:00Z",
    author: "Ada Lovelace",
    tags: ["vue", "typescript", "frontend"],
    description:
      "A practical introduction to the Composition API, refs, computed values, and how to structure reusable composables in a real project.",
    content:
      "The Composition API gives you a more flexible way to organize component logic by feature instead of by option type. In this post we look at refs, reactive, computed, and watchers, and how to extract them into composables that can be shared across components.",
    gitUrl: "https://github.com/example/vue3-composition-demo.git",
    files: [
      {
        id: 1,
        postId: "1",
        path: "src/composables/useCounter.ts",
        language: "typescript",
        content:
          "import { ref } from 'vue'\n\nexport function useCounter(initial = 0) {\n  const count = ref(initial)\n  const increment = () => count.value++\n  return { count, increment }\n}\n",
      },
      {
        id: 2,
        postId: "1",
        path: "src/App.vue",
        language: "vue",
        content:
          '<script setup lang="ts">\nimport { useCounter } from \'./composables/useCounter\'\nconst { count, increment } = useCounter()\n</script>\n\n<template>\n  <button @click="increment">Count: {{ count }}</button>\n</template>\n',
      },
    ],
  },
  {
    id: "2",
    title: "State Management with Pinia",
    dailyDevUrl: "https://dev.to/example/state-management-with-pinia-5678",
    externalUrl: "https://example.com/blog/state-management-pinia",
    timestamp: "2026-04-28T14:15:00Z",
    author: "Grace Hopper",
    tags: ["pinia", "vue", "state"],
    description:
      "Why Pinia is the recommended state library for Vue, and how its setup stores compare to options-style stores.",
    content:
      "Pinia replaces Vuex as the official Vue store. Setup stores read like regular composables: define refs and functions, return them, and Pinia handles reactivity and devtools integration.",
    gitUrl: "https://github.com/example/pinia-demo.git",
    files: [
      {
        id: 1,
        postId: "2",
        path: "src/stores/user.ts",
        language: "typescript",
        content:
          "import { ref } from 'vue'\nimport { defineStore } from 'pinia'\n\nexport const useUserStore = defineStore('user', () => {\n  const name = ref('')\n  const setName = (n: string) => (name.value = n)\n  return { name, setName }\n})\n",
      },
    ],
  },
  {
    id: "3",
    title: "Type-safe Routing in Vue Router",
    dailyDevUrl: "https://dev.to/example/type-safe-routing-vue-router-91011",
    externalUrl: "https://example.com/blog/type-safe-routing-vue-router",
    timestamp: "2026-04-10T08:00:00Z",
    author: "Linus Torvalds",
    tags: ["vue-router", "typescript"],
    description:
      "Patterns for getting end-to-end type safety in Vue Router 4+, including typed route params and named routes.",
    content:
      "Vue Router supports typed routes through declaration merging. Define a RouteNamedMap interface and you get autocomplete and type checking for router.push by name with the right params.",
    gitUrl: "https://github.com/example/vue-router-types.git",
    files: [
      {
        id: 1,
        postId: "3",
        path: "src/router/index.ts",
        language: "typescript",
        content:
          "import { createRouter, createWebHistory } from 'vue-router'\n\nconst router = createRouter({\n  history: createWebHistory(),\n  routes: [\n    { path: '/', name: 'home', component: () => import('../views/Home.vue') },\n  ],\n})\n\nexport default router\n",
      },
    ],
  },
  {
    id: "4",
    title: "Testing Components with Vitest",
    dailyDevUrl: "https://dev.to/example/testing-components-vitest-121314",
    externalUrl: "https://example.com/blog/testing-components-vitest",
    timestamp: "2026-03-22T17:45:00Z",
    author: "Margaret Hamilton",
    tags: ["vitest", "testing"],
    description:
      "Setting up Vitest with Vue Test Utils for component-level testing that runs fast and integrates with Vite.",
    content:
      "Vitest shares Vite\u2019s config and is a drop-in for Jest in most ways. Pair it with @vue/test-utils mount and you get fast, type-safe component tests.",
    gitUrl: "https://github.com/example/vitest-vue.git",
    files: [
      {
        id: 1,
        postId: "4",
        path: "src/__tests__/Counter.spec.ts",
        language: "typescript",
        content:
          "import { mount } from '@vue/test-utils'\nimport { describe, expect, it } from 'vitest'\nimport Counter from '../Counter.vue'\n\ndescribe('Counter', () => {\n  it('increments on click', async () => {\n    const wrapper = mount(Counter)\n    await wrapper.find('button').trigger('click')\n    expect(wrapper.text()).toContain('1')\n  })\n})\n",
      },
    ],
  },
  {
    id: "5",
    title: "Building Accessible UI Components",
    dailyDevUrl: "https://dev.to/example/building-accessible-ui-components-151617",
    externalUrl: "https://example.com/blog/accessible-ui-components",
    timestamp: "2026-02-08T11:20:00Z",
    author: "Tim Berners-Lee",
    tags: ["a11y", "frontend"],
    description:
      "Keyboard navigation, ARIA roles, and focus management patterns to make custom components usable for everyone.",
    content:
      "Accessibility starts with semantic HTML. When you must build custom widgets, follow the WAI-ARIA Authoring Practices for roles, states, and keyboard interaction.",
    gitUrl: "https://github.com/example/a11y-components.git",
    files: [
      {
        id: 1,
        postId: "5",
        path: "src/components/Accordion.vue",
        language: "vue",
        content:
          '<script setup lang="ts">\nimport { ref } from \'vue\'\nconst open = ref(false)\n</script>\n\n<template>\n  <button :aria-expanded="open" @click="open = !open">Toggle</button>\n  <div v-show="open"><slot /></div>\n</template>\n',
      },
    ],
  },
];

export const useBlogStore = defineStore("blog", () => {
  const posts = ref<BlogPostLazy[]>(samplePosts);
  const search = ref("");
  const activePostId = ref<string | null>(null);
  const activeTab = ref<ViewerTab>("post");
  const theme = ref<Theme>("light");
  const mobileView = ref<MobileView>("list");

  const filteredPosts = computed(() => {
    const q = search.value.trim().toLowerCase();
    if (!q) return posts.value;
    return posts.value.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    );
  });

  const activePost = computed(() => posts.value.find((p) => p.id === activePostId.value) ?? null);

  function selectPost(id: string, tab: ViewerTab) {
    activePostId.value = id;
    activeTab.value = tab;
    mobileView.value = "viewer";
  }

  function setTab(tab: ViewerTab) {
    activeTab.value = tab;
  }

  function toggleTheme() {
    theme.value = theme.value === "light" ? "dark" : "light";
  }

  function backToList() {
    mobileView.value = "list";
  }

  return {
    posts,
    search,
    activePostId,
    activeTab,
    theme,
    mobileView,
    filteredPosts,
    activePost,
    selectPost,
    setTab,
    toggleTheme,
    backToList,
  };
});
