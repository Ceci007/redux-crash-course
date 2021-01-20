import configureStore from "./store/configureStore";

const store = configureStore();

store.dispatch({
  type: "error",
  payload: { message: "An error occurred" }
})