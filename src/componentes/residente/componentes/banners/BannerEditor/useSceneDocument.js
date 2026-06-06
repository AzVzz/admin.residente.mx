import { useReducer, useCallback, useMemo } from "react";
import { emptyScene, newId } from "./sceneSchema.js";

const MAX_HISTORY = 50;

const pushHistory = (state) => {
  const past = [
    ...state.past.slice(-(MAX_HISTORY - 1)),
    structuredClone(state.scene),
  ];
  return { ...state, past, future: [] };
};

const initialState = {
  scene: emptyScene(),
  selectedId: null,
  past: [],
  future: [],
};

const reducer = (state, action) => {
  switch (action.type) {
    case "ADD_OBJECT": {
      const s = pushHistory(state);
      const obj = { id: newId(), zIndex: s.scene.objects.length + 1, variants: {}, ...action.payload };
      return { ...s, scene: { ...s.scene, objects: [...s.scene.objects, obj] }, selectedId: obj.id };
    }

    case "UPDATE_OBJECT": {
      const s = pushHistory(state);
      const { id, variant, changes } = action.payload;
      const objects = s.scene.objects.map((obj) => {
        if (obj.id !== id) return obj;
        if (variant === "desktop") return { ...obj, ...changes };
        return {
          ...obj,
          variants: { ...obj.variants, [variant]: { ...obj.variants?.[variant], ...changes } },
        };
      });
      return { ...s, scene: { ...s.scene, objects } };
    }

    case "REMOVE_OBJECT": {
      const s = pushHistory(state);
      const objects = s.scene.objects.filter((o) => o.id !== action.payload.id);
      return { ...s, scene: { ...s.scene, objects }, selectedId: null };
    }

    case "REORDER_OBJECT": {
      // delta: +1 bring forward, -1 send back
      const s = pushHistory(state);
      const { id, delta } = action.payload;
      const objects = s.scene.objects.map((o) => {
        if (o.id !== id) return o;
        return { ...o, zIndex: Math.max(1, o.zIndex + delta) };
      });
      return { ...s, scene: { ...s.scene, objects } };
    }

    case "SET_BACKGROUND": {
      const s = pushHistory(state);
      return { ...s, scene: { ...s.scene, background: { ...s.scene.background, ...action.payload } } };
    }

    case "SELECT":
      return { ...state, selectedId: action.payload.id };

    case "DESELECT":
      return { ...state, selectedId: null };

    case "LOAD_SCENE": {
      // Replace full scene (from backend or template). Confirm before calling.
      return { scene: action.payload.scene, selectedId: null, past: [], future: [] };
    }

    case "UNDO": {
      if (!state.past.length) return state;
      const previous = state.past[state.past.length - 1];
      const past = state.past.slice(0, -1);
      const future = [structuredClone(state.scene), ...state.future.slice(0, MAX_HISTORY - 1)];
      return { ...state, scene: previous, past, future, selectedId: null };
    }

    case "REDO": {
      if (!state.future.length) return state;
      const [next, ...future] = state.future;
      const past = [...state.past.slice(-(MAX_HISTORY - 1)), structuredClone(state.scene)];
      return { ...state, scene: next, past, future, selectedId: null };
    }

    default:
      return state;
  }
};

export const useSceneDocument = (initialScene) => {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    scene: initialScene ?? emptyScene(),
  });

  const addObject = useCallback((payload) => dispatch({ type: "ADD_OBJECT", payload }), []);
  const updateObject = useCallback((id, variant, changes) =>
    dispatch({ type: "UPDATE_OBJECT", payload: { id, variant, changes } }), []);
  const removeObject = useCallback((id) => dispatch({ type: "REMOVE_OBJECT", payload: { id } }), []);
  const reorderObject = useCallback((id, delta) =>
    dispatch({ type: "REORDER_OBJECT", payload: { id, delta } }), []);
  const setBackground = useCallback((changes) => dispatch({ type: "SET_BACKGROUND", payload: changes }), []);
  const select = useCallback((id) => dispatch({ type: "SELECT", payload: { id } }), []);
  const deselect = useCallback(() => dispatch({ type: "DESELECT" }), []);
  const loadScene = useCallback((scene) => dispatch({ type: "LOAD_SCENE", payload: { scene } }), []);
  const undo = useCallback(() => dispatch({ type: "UNDO" }), []);
  const redo = useCallback(() => dispatch({ type: "REDO" }), []);

  // Stable return object so EditorContext useMemo deps are stable.
  return useMemo(() => ({
    scene: state.scene,
    selectedId: state.selectedId,
    isUndoable: state.past.length > 0,
    isRedoable: state.future.length > 0,
    dispatch,
    addObject,
    updateObject,
    removeObject,
    reorderObject,
    setBackground,
    select,
    deselect,
    loadScene,
    undo,
    redo,
  }), [state.scene, state.selectedId, state.past.length, state.future.length,
       dispatch, addObject, updateObject, removeObject, reorderObject,
       setBackground, select, deselect, loadScene, undo, redo]);
};
