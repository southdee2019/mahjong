export const dispatchEvent = (evtName, params = {}) =>
  typeof window !== "undefined"
    ? window.dispatchEvent(new CustomEvent(evtName, { detail: params }))
    : false;

export const subscribe = (evtName, handler) => {
  if (typeof window !== "undefined") {
    window.addEventListener(evtName, handler);
  }

  return () =>
    typeof window !== "undefined"
      ? window.removeEventListener(evtName, handler)
      : true;
};
