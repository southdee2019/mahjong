import React from "react";
import { subscribe } from "@/utils/event";

const setDisplay = (ref, display) => {
  const _el = ref instanceof Element ? ref : ref.current;
  if (display && display !== "none") {
    _el.style.display = typeof display === "string" ? display : "flex";
    window.document.body.style.overflow = "hidden";
    _el.unsubscribe = subscribe("contextmenu", (e) => e.preventDefault());
  } else {
    _el.style.display = "none";
    window.document.body.style.overflow = "auto";
    if (_el.unsubscribe !== null || _el.unsubscribe !== undefined) {
      _el.unsubscribe();
    }
  }
};

const Spinning = () => (
  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-700 my-5"></div>
);

const Overlay = React.forwardRef(
  ({ children, onClick = () => false, className = "justify-center" }, ref) => (
    <div
      ref={ref}
      style={{ display: "none" }}
      className={`w-full h-full fixed z-50 top-0 left-0 bg-gray-900 bg-opacity-75 flex flex-col items-center ${className}`}
    >
      <div
        style={{ zIndex: -1 }}
        className="w-full h-full fixed top-0 left-0"
        onClick={onClick}
      />
      {children}
    </div>
  )
);
Overlay.displayName = "Overlay";

const _Loading = ({ title = "LOADING", ref }) => (
  <Overlay ref={ref}>
    <Spinning />
    <div className="text-2xl text-blue-800 opacity-90">
      <h2>{title}</h2>
    </div>
  </Overlay>
);

const _Prompt = ({
  title = "Title",
  content = "Content",
  onCloseHandler = () => true,
  buttons = [
    {
      id: "btn-close",
      title: "Close",
      style: "btn-primary"
    }
  ],
  ref
}) => (
  <Overlay ref={ref} onClick={() => onCloseHandler()}>
    <div className="modal-box">
      <h1 className="text-2xl text-blue-400 font-extrabold">{title}</h1>
      <hr className="border-blue-400" />
      <p className="my-5 mx-5">{content}</p>
      <div className="modal-action">
        {buttons.map((btn) => (
          <button
            key={btn.id}
            className={`btn ${!btn.style ? "" : btn.style}`}
            onClick={() => onCloseHandler(btn.id)}
          >
            {btn.title}
          </button>
        ))}
      </div>
    </div>
  </Overlay>
);

const Prompt = React.forwardRef((props, ref) => _Prompt({ ...props, ref }));
Prompt.displayName = "Prompt";

const Loading = React.forwardRef((props, ref) => _Loading({ ...props, ref }));
Loading.displayName = "Loading";

export { setDisplay, Spinning, Overlay, Loading, Prompt };
