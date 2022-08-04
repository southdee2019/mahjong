import React from "react";
import { getThemeList, ThemeChanger } from "@/components/common/themeselector";
import Icon from "@/components/common/icon";

export const GameNavbar = ({
  connectionStatus,
  title,
  t,
  menu = [],
  className = "sticky top-0 z-10 shadow-lg bg-neutral text-neutral-content"
}) => (
  <div className={`navbar ${className}`}>
    <div className="px-2 mx-2 navbar-start">
      <div className="indicator">
        <span
          className={`indicator-item indicator-start badge ${
            connectionStatus === "connected" ? "badge-success" : "badge-error"
          }`}
        ></span>
        <div className="truncate text-2xl font-bold text-neutral-content">
          {title}
        </div>
      </div>
    </div>
    <div className="navbar-end">
      <ThemeChanger
        themeList={getThemeList().reduce(
          (obj, theme) => ({ ...obj, [theme]: t(`theme:theme-${theme}`) }),
          {}
        )}
      />
      <div className="dropdown dropdown-end">
        <label tabIndex="1" className="btn btn-ghost btn-circle">
          <Icon name="more" />
        </label>
        <ul
          tabIndex="1"
          className="p-2 shadow menu dropdown-content bg-primary rounded-box w-52"
        >
          {menu.map(({ name, onClick }, idx) => (
            <li key={idx}>
              <button className="btn btn-sm btn-link" onClick={onClick}>
                {t(`game:btn-${name}`)}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);
