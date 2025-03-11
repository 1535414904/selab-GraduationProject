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
      setMessage("登入時發生錯誤");
    }
  };

  useEffect(() => {
    if (message === "登入成功") {
      fullTogglePage("systemPage");
      setNowUsername(username);
    }
  }, [message, fullTogglePage, setNowUsername, username]);

  return (
    <div className="flex items-center justify-center w-full h-screen bg-gradient-to-br from-blue-800 via-blue-600 to-blue-400">
      <div className="w-full max-w-md bg-white bg-opacity-95 p-8 rounded-lg shadow-2xl transform transition-all duration-500 hover:scale-105">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">手術排班網站</h1>
        <h1 className="text-2xl font-semibold text-gray-700 mb-6 text-center">登入</h1>

        <input
          className="w-full px-4 py-3 mb-3 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:shadow-lg"
          placeholder="帳號"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        {error.username && <p className="text-red-600 text-sm">{error.username}</p>}

        <input
          className="w-full px-4 py-3 mt-2 mb-3 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:shadow-lg"
          placeholder="密碼"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error.password && <p className="text-red-600 text-sm">{error.password}</p>}
        {message && <p className="text-red-600 text-sm text-center">{message}</p>}

        <div className="flex justify-between w-full mt-4">
          <button
            className="text-sm text-blue-600 font-semibold hover:underline transition-all duration-300"
            onClick={() => togglePage("forgotPasswordPage")}
          >
            忘記密碼？
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-900 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-110 shadow-md"
            onClick={confirmHandler}
          >
            確認
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginWrapper;
