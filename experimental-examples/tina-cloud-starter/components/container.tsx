import React from "react";

export const Container = ({
  children,
  size = "medium",
  className = "",
  ...props
}) => {
  const verticalPadding = {
    small: "py-8",
    medium: "py-12",
    large: "py-24",
    default: "py-12",
  };

  return (
    <div
      className={`max-w-7xl mx-auto px-6 sm:px-8 ${verticalPadding[size]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
