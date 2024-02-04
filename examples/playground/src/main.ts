import { createApp, h, ref } from "chibivue";

const app = createApp({
  setup() {
    const count = ref({ test: 0 });

    return () =>
      h("div", {}, [
        h("p", {}, [`count: ${count.value.test}`]),
        h("button", { onClick: () => count.value.test++ }, ["Increment"]),
      ]);
  },
});

app.mount("#app");
