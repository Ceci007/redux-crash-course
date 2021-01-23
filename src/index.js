import configureStore from "./store/configureStore";
import { loadBugs, resolveBug } from "./store/bugs";

const store = configureStore();

store.dispatch(loadBugs());

setTimeout(() => store.dispatch(resolveBug(1)), 2000);

