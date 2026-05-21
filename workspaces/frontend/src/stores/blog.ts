import { computed, ref } from "vue";
import { defineStore } from "pinia";

export interface BlogFile {
  path: string;
  content: string;
}

export interface BlogPost {
  id: string;
  title: string;
  timestamp: string;
  author: string;
  tags: string[];
  description: string;
  content: string;
  gitUrl: string;
  files: BlogFile[];
}

export type ViewerTab = "post" | "code";
export type Theme = "light" | "dark";

const samplePosts: BlogPost[] = [
  {
    id: "1",
    title: "Getting Started with Vue 3 Composition API",
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
        path: "src/composables/useCounter.ts",
        content:
          "import { ref } from 'vue'\n\nexport function useCounter(initial = 0) {\n  const count = ref(initial)\n  const increment = () => count.value++\n  return { count, increment }\n}\n",
      },
      {
        path: "src/App.vue",
        content:
          '<script setup lang="ts">\nimport { useCounter } from \'./composables/useCounter\'\nconst { count, increment } = useCounter()\n</script>\n\n<template>\n  <button @click="increment">Count: {{ count }}</button>\n</template>\n',
      },
    ],
  },
  {
    id: "2",
    title: "State Management with Pinia",
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
        path: "src/stores/user.ts",
        content:
          "import { ref } from 'vue'\nimport { defineStore } from 'pinia'\n\nexport const useUserStore = defineStore('user', () => {\n  const name = ref('')\n  const setName = (n: string) => (name.value = n)\n  return { name, setName }\n})\n",
      },
    ],
  },
  {
    id: "3",
    title: "Type-safe Routing in Vue Router",
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
        path: "src/router/index.ts",
        content:
          "import { createRouter, createWebHistory } from 'vue-router'\n\nconst router = createRouter({\n  history: createWebHistory(),\n  routes: [\n    { path: '/', name: 'home', component: () => import('../views/Home.vue') },\n  ],\n})\n\nexport default router\n",
      },
    ],
  },
  {
    id: "4",
    title: "Testing Components with Vitest",
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
        path: "src/__tests__/Counter.spec.ts",
        content:
          "import { mount } from '@vue/test-utils'\nimport { describe, expect, it } from 'vitest'\nimport Counter from '../Counter.vue'\n\ndescribe('Counter', () => {\n  it('increments on click', async () => {\n    const wrapper = mount(Counter)\n    await wrapper.find('button').trigger('click')\n    expect(wrapper.text()).toContain('1')\n  })\n})\n",
      },
    ],
  },
  {
    id: "5",
    title: "Building Accessible UI Components",
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
        path: "src/components/Accordion.vue",
        content:
          '<script setup lang="ts">\nimport { ref } from \'vue\'\nconst open = ref(false)\n</script>\n\n<template>\n  <button :aria-expanded="open" @click="open = !open">Toggle</button>\n  <div v-show="open"><slot /></div>\n</template>\n',
      },
    ],
  },
];

export const useBlogStore = defineStore("blog", () => {
  const posts = ref<BlogPost[]>(samplePosts);
  const search = ref("");
  const activePostId = ref<string | null>(null);
  const activeTab = ref<ViewerTab>("post");
  const theme = ref<Theme>("light");

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
  }

  function setTab(tab: ViewerTab) {
    activeTab.value = tab;
  }

  function toggleTheme() {
    theme.value = theme.value === "light" ? "dark" : "light";
  }

  return {
    posts,
    search,
    activePostId,
    activeTab,
    theme,
    filteredPosts,
    activePost,
    selectPost,
    setTab,
    toggleTheme,
  };
});
