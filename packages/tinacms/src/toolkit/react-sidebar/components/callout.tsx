import * as React from "react";
import { AiFillWarning } from "react-icons/ai";
import { cn } from "../../../lib/utils";
import { MdInfo } from "react-icons/md";

export const Callout = ({
  children,
  calloutStyle = "warning",
  className = "",
  ...props
}: {
  children?: React.ReactNode;
  calloutStyle?: "warning" | "info";
} & React.HTMLProps<HTMLDivElement>) => {
  const commonAlertStyles = "ml-8 text-sm px-4 py-3 rounded-md border";

  const styles = {
    warning: `text-amber-700 bg-amber-100 border-amber-700/20`,
    info: `text-blue-600 bg-blue-100/50 border-blue-600/20`,
  };

  const icon = {
    warning: (
      <AiFillWarning className="w-5 h-auto inline-block mr-1 opacity-70 text-amber-600" />
    ),
    info: (
      <MdInfo className="w-5 h-auto inline-block mr-1 opacity-70 text-[#1D4ED8]" />
    ),
  };

  return (
    <div
      className={cn(commonAlertStyles, styles[calloutStyle], className)}
      {...props}
    >
      {icon[calloutStyle]} {children}
    </div>
  );
};
