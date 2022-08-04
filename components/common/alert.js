import React from "react";
import {
  HiOutlineExclamation,
  HiOutlineExclamationCircle,
  HiOutlineBan,
  HiOutlineBadgeCheck
} from "react-icons/hi";

const _Icons = {
  info: <HiOutlineExclamationCircle className="w-6 h-6 mx-1 stroke-current" />,
  success: <HiOutlineBadgeCheck className="w-6 h-6 mx-1 stroke-current" />,
  warning: <HiOutlineExclamation className="w-6 h-6 mx-1 stroke-current" />,
  error: <HiOutlineBan className="w-6 h-6 mx-1 stroke-current" />
};

const Content = ({ type, message }) => (
  <div className="flex-1">
    {_Icons[type]}
    <label>
      <p>{message}</p>
    </label>
  </div>
);

const Alert = ({ show, type, message, className }) => {
  const _clsName = `${className ? className.trim() : ""} ${
    show ? "visible" : "invisible"
  }`;
  if (type === "info") {
    return (
      <div className={`alert alert-info ${_clsName}`}>
        <Content type={type} message={message} />
      </div>
    );
  }
  if (type === "success") {
    return (
      <div className={`alert alert-success ${_clsName}`}>
        <Content type={type} message={message} />
      </div>
    );
  }
  if (type === "warning") {
    return (
      <div className={`alert alert-warning ${_clsName}`}>
        <Content type={type} message={message} />
      </div>
    );
  }
  if (type === "error") {
    return (
      <div className={`alert alert-error ${_clsName}`}>
        <Content type={type} message={message} />
      </div>
    );
  }

  return (
    <div className={`alert ${_clsName}`}>
      <div className="flex-1">
        <label>
          <p>{message}</p>
        </label>
      </div>
    </div>
  );
};

export default Alert;
