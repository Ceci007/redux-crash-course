import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { createSelector } from "reselect";
import { addBug, getUnresolvedBugs } from "../bugs";
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