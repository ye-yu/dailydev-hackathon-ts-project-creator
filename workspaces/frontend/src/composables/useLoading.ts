import { computed, effect, ref } from "vue";

export function useLoading<T>(callback: () => PromiseLike<T>, computedValues: () => unknown) {
  const isLoadingContent = ref(false);
  const result = ref<T | null>(null);
  const error = ref<Error | null>(null);

  const execute = async () => {
    isLoadingContent.value = true;
    error.value = null;
    result.value = null;
    try {
      result.value = await callback();
    } catch (err) {
      error.value = err as Error;
    } finally {
      isLoadingContent.value = false;
    }
  };

  effect(() => {
    computedValues();
    execute();
  });

  return {
    isLoadingContent: computed(() => {
      console.log("isLoadingContent computed:", isLoadingContent.value);
      return isLoadingContent.value;
    }),
    result: computed(() => result.value),
    error: computed(() => error.value),
  };
}
