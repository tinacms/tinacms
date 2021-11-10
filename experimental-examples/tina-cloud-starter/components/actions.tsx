import Link from "next/link";
import * as React from "react";
import { BiRightArrowAlt } from "react-icons/bi";
import { ThemeContext } from "./theme";

export const Actions = ({
  parentColor = "default",
  parentField = "",
  className = "",
  actions,
}) => {
  const theme = React.useContext(ThemeContext);
  const buttonColorClasses = {
    blue: "text-white bg-blue-500 hover:bg-blue-600 bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-400 hover:to-blue-500",
    teal: "text-white bg-teal-500 hover:bg-teal-600 bg-gradient-to-r from-teal-400 to-teal-600 hover:from-teal-400 hover:to-teal-500",
    green:
      "text-white bg-green-500 hover:bg-green-600 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-400 hover:to-green-500",
    red: "text-white bg-red-500 hover:bg-red-600 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500",
    pink: "text-white bg-pink-500 hover:bg-pink-600 bg-gradient-to-r from-pink-400 to-pink-600 hover:from-pink-400 hover:to-pink-500",
    purple:
      "text-white bg-purple-500 hover:bg-purple-600 bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-400 hover:to-purple-500",
    orange:
      "text-white bg-orange-500 hover:bg-orange-600 bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-400 hover:to-orange-500",
    yellow:
      "text-gray-800 bg-yellow-500 hover:bg-yellow-600 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500",
  };

  const invertedButtonColorClasses = {
    blue: "text-blue-500 bg-white hover:bg-gray-50 bg-gradient-to-r from-gray-50 to-white hover:to-gray-100",
    teal: "text-teal-500 bg-white hover:bg-gray-50 bg-gradient-to-r from-gray-50 to-white hover:to-gray-100",
    green:
      "text-green-500 bg-white hover:bg-gray-50 bg-gradient-to-r from-gray-50 to-white hover:to-gray-100",
    red: "text-red-500 bg-white hover:bg-gray-50 bg-gradient-to-r from-gray-50 to-white hover:to-gray-100",
    pink: "text-pink-500 bg-white hover:bg-gray-50 bg-gradient-to-r from-gray-50 to-white hover:to-gray-100",
    purple:
      "text-purple-500 bg-white hover:bg-gray-50 bg-gradient-to-r from-gray-50 to-white hover:to-gray-100",
    orange:
      "text-orange-500 bg-white hover:bg-gray-50 bg-gradient-to-r from-gray-50 to-white hover:to-gray-100",
    yellow:
      "text-yellow-500 bg-white hover:bg-gray-50 bg-gradient-to-r from-gray-50 to-white hover:to-gray-100",
  };

  const linkButtonColorClasses = {
    blue: "text-blue-600 dark:text-blue-400 hover:text-blue-400 dark:hover:text-blue-200",
    teal: "ttext-teal-600 dark:text-teal-400 hover:text-teal-400 dark:hover:text-teal-200",
    green:
      "text-green-600 dark:text-green-400 hover:text-green-400 dark:hover:text-green-200",
    red: "text-red-600 dark:text-red-400 hover:text-red-400 dark:hover:text-red-200",
    pink: "text-pink-600 dark:text-pink-400 hover:text-pink-400 dark:hover:text-pink-200",
    purple:
      "text-purple-600 dark:text-purple-400 hover:text-purple-400 dark:hover:text-purple-200",
    orange:
      "text-orange-600 dark:text-orange-400 hover:text-orange-400 dark:hover:text-orange-200",
    yellow:
      "text-yellow-600 dark:text-yellow-400 hover:text-yellow-400 dark:hover:text-yellow-200",
  };

  return (
    <div className={`flex flex-wrap items-center gap-y-4 gap-x-6 ${className}`}>
      {actions &&
        actions.map(function (action, index) {
          let element = null;
          if (action.type === "button") {
            element = (
              <Link key={index} href={action.link ? action.link : "/"}>
                <button
                  data-tinafield={`${parentField}.${index}`}
                  className={`z-10 relative flex items-center px-7 py-3 font-semibold text-lg transition duration-150 ease-out  rounded transform focus:shadow-outline focus:outline-none focus:ring-2 ring-offset-current ring-offset-2 whitespace-nowrap ${
                    parentColor === "primary"
                      ? invertedButtonColorClasses[theme.color]
                      : buttonColorClasses[theme.color]
                  }`}
                >
                  {action.label}
                  {action.icon && (
                    <BiRightArrowAlt
                      className={`ml-1 -mr-1 w-6 h-6 opacity-80`}
                    />
                  )}
                </button>
              </Link>
            );
          }
          if (action.type === "link" || action.type === "linkExternal") {
            element = (
              <Link key={index} href={action.link ? action.link : "/"} passHref>
                <a
                  data-tinafield={`${parentField}.${index}`}
                  className={`group inline-flex items-center font-semibold text-lg transition duration-150 ease-out ${
                    parentColor === "primary"
                      ? `text-white  hover:text-gray-50`
                      : linkButtonColorClasses[theme.color]
                  }`}
                  style={{
                    textShadow: `0 3px 7px rgba(var(--color-rgb-blue-400),0.2)`,
                  }}
                >
                  {action.label}
                  {action.icon && (
                    <BiRightArrowAlt
                      className={`ml-0 mr-0 w-6 h-6 opacity-80`}
                    />
                  )}
                </a>
              </Link>
            );
          }
          return element;
        })}
    </div>
  );
};
