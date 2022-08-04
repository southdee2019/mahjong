import React from "react";
const Panel = ({
  bgImg = "",
  opacity = 100,
  children,
  contentStyle = "flex-col justify-center lg:flex-row",
  ...props
}) => {
  const _clsName = {
    "0": "hero-overlay bg-opacity-0",
    "5": "hero-overlay bg-opacity-5",
    "10": "hero-overlay bg-opacity-10",
    "20": "hero-overlay bg-opacity-20",
    "25": "hero-overlay bg-opacity-25",
    "30": "hero-overlay bg-opacity-30",
    "40": "hero-overlay bg-opacity-40",
    "50": "hero-overlay bg-opacity-50",
    "60": "hero-overlay bg-opacity-60",
    "70": "hero-overlay bg-opacity-70",
    "75": "hero-overlay bg-opacity-75",
    "80": "hero-overlay bg-opacity-80",
    "90": "hero-overlay bg-opacity-90",
    "95": "hero-overlay bg-opacity-95",
    "100": "hero-overlay bg-opacity-100"
  };

  const Content = () => {
    const _bgfixed = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      typeof window !== "undefined" ? window.navigator.userAgent : ""
    )
      ? "hero min-h-screen min-w-screen"
      : "hero min-h-screen min-w-screen bg-fixed";

    return (
      <div
        className={_bgfixed}
        style={bgImg.length === 0 ? {} : { backgroundImage: `url(${bgImg})` }}
        {...props}
      >
        <div className={_clsName[opacity.toString()]} />
        <div className={`hero-content ${contentStyle}`}>{children}</div>
      </div>
    );
  };

  return <Content />;
};

export default Panel;
