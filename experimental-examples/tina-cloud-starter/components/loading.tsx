import { FaSpinner } from "react-icons/fa";

export const Loading = ({ children }) => {
  return (
    <div className="absolute w-screen h-screen overflow-hidden top-0 left-0">
      {children}
      <FaSpinner className="animate-spin h-12 w-auto text-blue-500 absolute top-1/2 left-1/2 -m-6 z-50" />
      <div className="absolute z-40 w-full h-full top-0 left-0 bg-gradient-to-b from-transparent to-gray-50 dark:to-gray-900 opacity-70"></div>
    </div>
  );
};
