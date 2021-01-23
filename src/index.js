import configureStore from "./store/configureStore";
import { loadBugs, assignBugToUser } from "./store/bugs";

const store = configureStore();

store.dispatch(loadBugs());

setTimeout(() => store.dispatch(assignBugToUser(1, 4)), 2000);

