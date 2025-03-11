import axios from "axios";
import { useEffect, useState } from "react";
import { BASE_URL } from "../../config";

function ForgotPasswordWrapper({ togglePage, setNowUsername }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState({
    username: "",
    email: "",
  });

  const confirmHandler = () => {
    let notEmpty = true;
    const newError = { username: "", email: "" };
    if (!username.trim()) {
      newError.username = "*請輸入帳號";
      notEmpty = false;
    }
    if (!email.trim()) {
      newError.email = "*請輸入信箱";
      notEmpty = false;
    }
    setError(newError);
    if (notEmpty) {
      forgotPasswordHandler();
    }
  };

  const forgotPasswordHandler = async () => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/login/ForgotPassword`,
        {
          username,
          email,
        }
      );

      setMessage(response.data);
    } catch (error) {
      setMessage("找回密碼時發生錯誤");
    }
  };

  useEffect(() => {
    if (message === 1) {
      togglePage("changePasswordPage");
      setNowUsername(username);
    }
  }, [message, togglePage, setNowUsername, username]);

  return (
    <div className="flex items-center justify-center w-full h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500">
      <div className="w-full max-w-md bg-white bg-opacity-95 p-8 rounded-lg shadow-2xl transform transition-all duration-500 hover:scale-105">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">手術排班網站</h1>
        <h1 className="text-2xl font-semibold text-gray-700 mb-6 text-center">忘記密碼</h1>

        <input
          className="w-full px-4 py-3 mb-3 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:shadow-lg"
          placeholder="帳號"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        {error.username && <p className="text-red-600 text-sm">{error.username}</p>}

        <input
          className="w-full px-4 py-3 mt-2 mb-3 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:shadow-lg"
          placeholder="電子信箱"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {error.email && <p className="text-red-600 text-sm">{error.email}</p>}
        {message && <p className="text-red-600 text-sm text-center">{message}</p>}

        <div className="flex justify-between w-full mt-4">
          <button
            className="text-sm text-blue-600 font-semibold hover:text-blue-100 hover:underline transition-all duration-300"
            onClick={() => togglePage("loginPage")}
          >
            返回登入
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-110 shadow-md"
            onClick={confirmHandler}
          >
            確認
          </button>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordWrapper;
