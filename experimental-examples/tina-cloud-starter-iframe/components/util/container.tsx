import React from "react";

export const Container = ({
  children,
  size = "medium",
  width = "large",
  className = "",
  ...props
}) => {
  const verticalPadding = {
    custom: "",
    small: "py-8",
    medium: "py-12",
    large: "py-24",
    default: "py-12",
  };
  const widthClass = {
    small: "max-w-4xl",
    medium: "max-w-5xl",
    large: "max-w-7xl",
    custom: "",
  };

  return (
    <div
      className={`${widthClass[width]} mx-auto px-6 sm:px-8 ${verticalPadding[size]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
