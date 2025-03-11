/* eslint-disable react/prop-types */
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { useState, useRef, useEffect } from "react";

function UserList({ fullTogglePage, name, toggleMainPage }) {
  const [isListOpen, setListOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleMenu = () => {
    setListOpen(!isListOpen);
  };

  // 點擊外部關閉下拉選單
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setListOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 用戶按鈕 */}
      <button
        className={`flex items-center text-2xl space-x-2 py-2 px-3 rounded-full ${
          isListOpen ? "bg-white text-blue-700" : "text-white hover:bg-blue-600"
        } transition-all duration-300`}
        onClick={toggleMenu}
      >
        <FontAwesomeIcon icon={faUser} className="text-sm" />
        <span className="hidden md:inline text-2xl font-medium">{name}</span>
        <svg
          className={`h-4 w-4 transition-transform duration-300 ${
            isListOpen ? "transform rotate-180" : ""
          }`}
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

      {/* 下拉選單 */}
      {isListOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 transform origin-top-right transition-all duration-300">
          <div className="px-4 py-2 text-lg text-gray-500 border-b border-gray-100">
            <p>已登入為</p>
            <p className="font-semibold text-gray-700">{name}</p>
          </div>

          <button
            className="block w-full text-left px-4 py-2 text-2xl text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            onClick={() => {
              toggleMainPage("userProfile");
              setListOpen(false);
            }}
          >
            <div className="flex items-center">
              <svg
                className="mr-2 h-4 w-4 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
              個人資料
            </div>
          </button>

          <button
            className="block w-full text-left px-4 py-2 text-2xl text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            onClick={() => fullTogglePage("loginPage")}
          >
            <div className="flex items-center">
              <svg
                className="mr-2 h-4 w-4 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-4-4H3zm9 2.414L15.414 9H12V5.414z"
                  clipRule="evenodd"
                />
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" />
              </svg>
              登出
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

export default UserList;
