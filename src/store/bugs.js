import { createSlice } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';
import axios from "axios";
import { apiCallBegan } from './api';
import moment from 'moment';

const slice = createSlice({
  name: 'bugs',
  initialState: {
    list: [],
    loading: false,
    lastFetch: null
  },
  // reducers
  reducers: {
    bugsRequested: (bugs, action) => {
      bugs.loading = true;
    },

    bugsReceived: (bugs, action) => {
      bugs.list = action.payload;
      bugs.loading = false;
      bugs.lastFetch = Date.now();
    },

    bugsRequestFailed: (bugs, action) => {
      bugs.loading = false;
    },

    bugAssignedToUser: (bugs, action) => {
      const { id: bugId, userId } = action.payload;
      const index = bugs.list.findIndex(bug => bug.id === bugId);
      bugs.list[index].userId = userId;
    },

    bugAdded: (bugs, action) => {
      bugs.list.push(action.payload);
    },

    bugResolved: (bugs, action) => {
      const index = bugs.list.findIndex(bug => bug.id === action.payload.id);
      bugs.list[index].resolved = true;
    }
  }
});

export const { 
  bugAdded, 
  bugResolved, 
  bugAssignedToUser, 
  bugsReceived,
  bugsRequested,
  bugsRequestFailed 
} = slice.actions;
export default slice.reducer;

const url = "/bugs";

// actions
export const loadBugs = () => (dispatch, getState) => {
  const { lastFetch } = getState().entities.bugs;
  
  const diffInMinutes = moment().diff(moment(lastFetch), 'minutes');
  if (diffInMinutes < 10) return;

  return dispatch(
    apiCallBegan({
      url,
      onStart: bugsRequested.type,
      onSuccess: bugsReceived.type,
      onError: bugsRequestFailed.type
    })
  );
}

export const addBug = bug => apiCallBegan({
  url,
  method: "post",
  data: bug,
  onSuccess: bugAdded.type
}); 

export const resolveBug = id => apiCallBegan({
  url: url + '/' + id,
  method: "patch",
  data: { resolved: true },
  onSuccess: bugResolved.type
});

export const assignBugToUser = (bugId, userId) => apiCallBegan({
  url: url + '/' + bugId,
  method: 'patch',
  data: { userId },
  onSuccess: bugAssignedToUser.type
});

// selectors
export const getUnresolvedBugs = createSelector(
  state => state.entities.bugs,
  state => state.entities.projects,
  (bugs, projects) => bugs.list.filter(bug => !bug.resolved)
);

export const getBugsByUser = userId => createSelector(
  state => state.entities.bugs,
  bugs => bugs.list.filter(bug => bug.userId === userId)
);

