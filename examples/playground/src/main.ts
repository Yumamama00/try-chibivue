import { createApp, ref, h, reactive, watch } from "chibivue";

const app = createApp({
  setup() {
    const state = reactive({ count: 0 });
    const stateRef = ref(0);

    const count = ref(0);
    const count2 = ref(0);
    const count3 = ref(0);

    watch(
      () => state.count,
      () => alert("state.count was changed!"),
      { immediate: true }
    );

    watch(stateRef, () => alert("stateRef was changed!"));

    watch([count, count2, count3], () => {
      alert("some count was changed!");
    });

    return () =>
      h("div", {}, [
        h("p", {}, [`state: ${state.count}`]),
        h("button", { onClick: () => state.count++ }, ["update state"]),
        h("p", {}, [`stateRef: ${stateRef.value}`]),
        h("button", { onClick: () => stateRef.value++ }, ["update stateRef"]),
        h("p", {}, [`count: ${count.value}`]),
        h("button", { onClick: () => count.value++ }, ["update count"]),
        h("p", {}, [`count2: ${count2.value}`]),
        h("button", { onClick: () => count2.value++ }, ["update count2"]),
        h("p", {}, [`count3: ${count3.value}`]),
        h("button", { onClick: () => count3.value++ }, ["update count3"]),
      ]);
  },
});

app.mount("#app");
