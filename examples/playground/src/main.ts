import { createApp, h, reactive } from "chibivue";

const app = createApp({
  setup() {
    const state = reactive({
      message: "Hello World",
    });
    const updateState = () => {
      state.message = "Hello ChibiVue!";
      state.message = "Hello ChibiVue!!";
      state.message = "Hello ChibiVue!!!";
    };

    return () => {
      console.log("😎 rendered!");

      return h("div", { id: "app" }, [
        h("p", {}, [`message: ${state.message}`]),
        h("button", { onClick: updateState }, ["update"]),
      ]);
    };
  },
});

app.mount("#app");
