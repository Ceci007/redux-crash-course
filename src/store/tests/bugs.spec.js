import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { addBug, getUnresolvedBugs, resolveBug } from "../bugs";
import configureStore from "../configureStore";

describe("bugsSlice", () => {
  let fakeAxios;
  let store;

  beforeEach(() => {
    fakeAxios = new MockAdapter(axios);
    store = configureStore();
  })

  const bugsSlice = () => store.getState().entities.bugs;

  const createState = () => ({
    entities: {
      bugs: {
        list: []
      }
    }
  });

  it("should mark the bug as resolved if it's saved to the server", async () => {
    // Arrange
    fakeAxios.onPatch("/bugs/1").reply(200, { id: 1, resolved: true });
    fakeAxios.onPost("/bugs").reply(200, { id: 1 });

    // Act
    await store.dispatch(addBug({}));
    await store.dispatch(resolveBug(1));

    // Assert
    expect(bugsSlice().list[0].resolved).toBe(true);
  });

  it("should not mark the bug as resolved if it's not saved to the server", async () => {
    // Arrange
    fakeAxios.onPatch("/bugs/1").reply(500);
    fakeAxios.onPost("/bugs").reply(200, { id: 1 });

    // Act
    await store.dispatch(addBug({}));
    await store.dispatch(resolveBug(1));

    // Assert
    expect(bugsSlice().list[0].resolved).not.toBe(true);
  });

  it("should add the bug to the store if it's saved to the server", async () => {
    // Arrange
    const bug = { description: "a" };
    const savedBug = { ...bug, id: 1 };
    fakeAxios.onPost('/bugs').reply(200, savedBug);

    // Act
    await store.dispatch(addBug(bug));

    // Assert
    expect(bugsSlice().list).toContainEqual(savedBug);
  });

  it("should not add the bug to the store if it's not saved to the server", async () => {
    // Arrange
    const bug = { description: "a" };
    fakeAxios.onPost('/bugs').reply(500);

    // Act
    await store.dispatch(addBug(bug));

    // Assert
    expect(bugsSlice().list).toHaveLength(0);
  });

  describe("selectors", () => {
    it("getUnresolvedBugs", () => {
      // Arrange
      const state = createState();
      state.entities.bugs.list = [{ id: 1, resolved: true }, { id: 2 }, { id: 3 }];

      // Act
      const result = getUnresolvedBugs(state);

      // Assert
      expect(result).toHaveLength(2);
    })
  })
});