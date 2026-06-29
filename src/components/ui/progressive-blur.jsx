import React from "react";

const ProgressiveBlur = ({
  className = "",
  backgroundColor = "#000000",
  position = "top",
  height = "250px",
  blurAmount = "8px",
}) => {
  const isTop = position === "top";
  const isTopRight = position === "top-right";

  const baseStyle = {
    WebkitBackdropFilter: `blur(${blurAmount})`,
    backdropFilter: `blur(${blurAmount})`,
    WebkitUserSelect: "none",
    userSelect: "none",
  };

  if (isTopRight) {
    return (
      <div
        className={`pointer-events-none absolute right-0 top-0 select-none ${className}`}
        style={{
          ...baseStyle,
          width: "600px",
          height: "400px",
          maxWidth: "100vw",
          background: `radial-gradient(ellipse at top right, ${backgroundColor} 0%, transparent 70%)`,
          maskImage: `radial-gradient(ellipse at top right, black 20%, transparent 70%)`,
          WebkitMaskImage: `radial-gradient(ellipse at top right, black 20%, transparent 70%)`,
        }}
      />
    );
  }

  return (
    <div
      className={`pointer-events-none absolute left-0 w-full select-none ${className}`}
      style={{
        ...baseStyle,
        [isTop ? "top" : "bottom"]: 0,
        height,
        background: isTop
          ? `linear-gradient(to top, transparent, ${backgroundColor})`
          : `linear-gradient(to bottom, transparent, ${backgroundColor})`,
        maskImage: isTop
          ? `linear-gradient(to bottom, black 50%, transparent)`
          : `linear-gradient(to top, black 50%, transparent)`,
        WebkitMaskImage: isTop
          ? `linear-gradient(to bottom, black 50%, transparent)`
          : `linear-gradient(to top, black 50%, transparent)`,
      }}
    />
  );
};

export { ProgressiveBlur };

