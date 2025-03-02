import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../config";
import "./LoginPage.css";

function LoginWrapper({ togglePage, fullTogglePage, setNowUsername }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState({
    username: "",
    password: "",
  });

  const confirmHandler = () => {
    let notEmpty = true;
    const newError = { username: "", password: "" };
    if (!username.trim()) {
      newError.username = "*請輸入帳號";
      notEmpty = false;
    }
    if (!password.trim()) {
      newError.password = "*請輸入密碼";
      notEmpty = false;
    }
    setError(newError);
    if (notEmpty) {
      loginHandler();
    }
  };

  const loginHandler = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/api/login`, {
        username,
        password,
      });
      setMessage(response.data);
    } catch (error) {
      setMessage("Error during login");
    }
  };

  useEffect(() => {
    if (message === "登入成功") {
      fullTogglePage("systemPage");
      setNowUsername(username);
    }
  }, [message, fullTogglePage, setNowUsername, username]);

  const handleKeyDown = (e, type) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (type === "username") {
        document.getElementById("passwordInput").focus();
      } else if (type === "password") {
        confirmHandler();
      } else if (type === "button") {
        confirmHandler();
      }
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-screen bg-gray-100">
      <div className="w-full h-full flex flex-col items-center justify-center bg-white md:p-8">
        <div className="w-full max-w-lg mx-auto px-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
            手術排班網站
          </h1>
          <h1 className="text-2xl font-semibold text-gray-700 mb-6 text-center">
            登入
          </h1>

          <input
            id="usernameInput"
            className="w-full px-4 py-3 mb-1 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="帳號"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, "username")}
          />
          <div className="w-full flex justify-between items-center mb-4">
            <div></div>
            {error.username && (
              <p className="text-red-600 text-sm">{error.username}</p>
            )}
          </div>

          <input
            id="passwordInput"
            className="w-full px-4 py-3 mb-1 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="密碼"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, "password")}
          />

          <div className="w-full flex justify-between items-center mb-6">
            <button
              className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
              onClick={() => togglePage("forgotPasswordPage")}
            >
              忘記密碼
            </button>
            <div className="text-right">
              {error.password && (
                <p className="text-red-600 text-sm">{error.password}</p>
              )}
              {message && <p className="text-red-600 text-sm">{message}</p>}
            </div>
          </div>

          <button
            id="confirmButton"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300"
            onClick={confirmHandler}
            onKeyDown={(e) => handleKeyDown(e, "button")}
          >
            確認
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginWrapper;
