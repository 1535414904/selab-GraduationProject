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
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setMessage("Error during to find email");
    }
  };

  useEffect(() => {
    console.log("Current message:", message);
    if (message === 1) {
      togglePage("changePasswordPage");
      setNowUsername(username);
    }
  }, [message, togglePage, setNowUsername, username]);

  const handleKeyDown = (e, type) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (type === "username") {
        document.getElementById("emailInput").focus();
      } else if (type === "email") {
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
            忘記密碼
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
            id="emailInput"
            className="w-full px-4 py-3 mb-1 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="電子信箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, "email")}
          />

          <div className="w-full flex justify-between items-center mb-6">
            <div></div>
            <div className="text-right">
              {error.email && (
                <p className="text-red-600 text-sm">{error.email}</p>
              )}
              {message && <p className="text-red-600 text-sm">{message}</p>}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
              onClick={() => togglePage("loginPage")}
            >
              返回登入
            </button>

            <button
              id="confirmButton"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-300"
              onClick={confirmHandler}
              onKeyDown={(e) => handleKeyDown(e, "button")}
            >
              確認
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordWrapper;
