/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import axios from "axios";
import { BASE_URL } from "../../config";

function LoginWrapper({ togglePage, fullTogglePage, setNowUsername}) {

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
      setNowUsername(username)
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
    <div className="login-wrapper">
      <h1 className="login-title">手術排班網站</h1>
      <h1 className="login-title">登入</h1>

      <input
        id="usernameInput"
        className="login-input"
        placeholder="帳號"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        onKeyDown={(e) => handleKeyDown(e, "username")}/>
        
      <div className="error-forgot-container">
        <div></div>
        {error.username && <p className="error">{error.username}</p>}
      </div>

      <input
        id="passwordInput"
        className="login-input"
        placeholder="密碼"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => handleKeyDown(e, "password")}/>

      <div className="error-forgot-container">
        <button
          className="forgot-password"
          onClick={() => togglePage("forgotPasswordPage")}>忘記密碼</button>
        {error.password && <p className="error">{error.password}</p>}
        {message && <p className="error">{message}</p>}
      </div>

      <button
        id="confirmButton"
        className="confirm"
        onClick={confirmHandler}
        onKeyDown={(e) => handleKeyDown(e, "button")}
      >
        確認
      </button>
    </div>
  );
}

export default LoginWrapper;
