import UserList from "./UserList";
import "../SystemPage.css";
import { useEffect } from "react";

/* eslint-disable react/prop-types */

function HeaderWrapper({ fullTogglePage, user, toggleMainPage, setReloadKey }) {
  useEffect(() => {
      toggleMainPage("mainPage");
  }, [toggleMainPage]);
  return (
    <div className="w-full bg-gradient-to-r from-blue-700 to-blue-900 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Hospital Name */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-8 w-8 text-white"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path>
              </svg>
            </div>
            <div className="ml-2">
              <span className="text-white text-lg font-semibold">
                手術排班系統
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-1">
            <button
              className="px-3 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-500 transition duration-300"
              onClick={() => toggleMainPage("mainPage")}
            >
              首頁
            </button>


            {user.role == 3 && (
              <div className="ml-4 relative group">
                <button className="px-3 py-2 text-white hover:bg-blue-600 rounded-md transition duration-300 flex items-center">
                  管理功能
                  <svg
                    className="ml-1 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                <div className="dropdown-menu absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg py-1">
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      toggleMainPage("accountMgr");
                      setReloadKey((prevKey) => prevKey + 1);
                    }}
                  >
                    帳號管理
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      toggleMainPage("departmentMgr");
                      setReloadKey((prevKey) => prevKey + 1);
                    }}
                  >
                    科別管理
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      toggleMainPage("ORMgr");
                      setReloadKey((prevKey) => prevKey + 1);
                    }}
                  >
                    手術房管理
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      toggleMainPage("surgeryMgr");
                      setReloadKey((prevKey) => prevKey + 1);
                    }}
                  >
                    手術管理
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      toggleMainPage("accountMgr");
                      setReloadKey((prevKey) => prevKey + 1);
                    }}
                  >
                    排班管理
                  </button>
                </div>
              </div>
            )}

            {/* Quick Access Icons */}
            {/* <div className="hidden md:flex items-center ml-4 space-x-3">
              <button className="text-white hover:text-blue-200 transition duration-300">
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              </button>
              <button className="text-white hover:text-blue-200 transition duration-300">
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </button>
              <button className="text-white hover:text-blue-200 transition duration-300">
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                </svg>
              </button>
            </div> */}

            {/* User Profile */}
            <div className="ml-4">
              <UserList
                fullTogglePage={fullTogglePage}
                name={user.name}
                toggleMainPage={toggleMainPage}
              />
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}

export default HeaderWrapper;
