import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import Icon from "@/components/common/icon";

export const getThemeList = () => [
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "winter"
];

export const ThemeChanger = ({
  themeList = { light: "Light Mode", dark: "Dark Mode" },
  className = "btn",
  height = "h-64",
  direction = "dropdown-end",
  icon = <Icon name="dropdown" />
}) => {
  const { theme, setTheme } = useTheme();
  const [_activeTheme, _setActiveTheme] = useState("Unknown");

  useEffect(() => {
    _setActiveTheme(theme);
    return () => true;
  }, [theme, _setActiveTheme]);

  return (
    <div className={`dropdown ${direction}`}>
      <label tabIndex="0" className={className}>
        {themeList.hasOwnProperty(_activeTheme) ? themeList[_activeTheme] : ""}
        &nbsp;
        {icon}
      </label>
      <ul
        tabIndex="0"
        className={`${height} overflow-y-auto p-2 shadow menu menu-compact dropdown-content bg-primary rounded-box w-52`}
      >
        {Object.keys(themeList).map((k) => (
          <li key={k}>
            <button
              className="btn btn-link btn-sm"
              onClick={() => {
                setTheme(k);
                _setActiveTheme(k);
              }}
            >
              {themeList[k]}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
