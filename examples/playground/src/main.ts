import { createApp, h, shallowRef } from "chibivue";

const app = createApp({
  setup() {
    const state = shallowRef({ count: 0 });

    return () =>
      h("div", {}, [
        h("p", {}, [`count: ${state.value.count}`]),

        h(
          "button",
          {
            onClick: () => {
              state.value = { count: state.value.count + 1 };
            },
          },
          ["increment"]
        ),

        h(
          "button", // clickしても描画は更新されない
          {
            onClick: () => {
              state.value.count++;
            },
          },
          ["not trigger ..."]
        ),
      ]);
  },
});

app.mount("#app");
