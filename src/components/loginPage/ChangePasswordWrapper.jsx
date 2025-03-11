import axios from "axios";
import { useState } from "react";
import { BASE_URL } from "../../config";

function ChangePasswordWrapper({ togglePage, username }) {
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordAgain, setNewPasswordAgain] = useState("");
  const [message, setMessage] = useState("");
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [error, setError] = useState({
    newPassword: "",
    newPasswordAgain: "",
    passwordNotEqquals: "",
  });

  const confirmHandler = () => {
    console.log("nowusername:", username);
    let notEmpty = true;
    const newError = {
      newPassword: "",
      newPasswordAgain: "",
      passwordNotEqquals: "",
    };
    if (!newPassword.trim()) {
      newError.newPassword = "*請輸入新密碼";
      notEmpty = false;
    }
    if (newPassword.trim() && !newPasswordAgain.trim()) {
      newError.newPasswordAgain = "*請再次輸入新密碼";
      notEmpty = false;
    }
    if (notEmpty) {
      if (newPassword == newPasswordAgain) {
        changePasswordHandler();
      } else {
        newError.passwordNotEqquals = "*兩個密碼不相同";
      }
    }
    setError(newError);
  };

  const changePasswordHandler = async () => {
    try {
      const response = await axios.put(
        `${BASE_URL}/api/login/changePassword/${username}`,
        {
          password: newPassword,
        }
      );
      setMessage(response.data);
      if (response.data === "Change Password successfully") {
        setPasswordChanged(true);
      }
    } catch {
      setMessage("Error during to check password");
    }
  };

  const handleKeyDown = (e, type) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (type === "newPassword") {
        document.getElementById("newPasswordAgainInput").focus();
      } else if (type === "newPasswordAngin") {
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
            更改密碼
          </h1>

          {!passwordChanged ? (
            <>
              <input
                id="newPasswordInput"
                className="w-full px-4 py-3 mb-1 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="新密碼"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, "newPassword")}
              />
              <div className="w-full flex justify-between items-center mb-4">
                <div></div>
                {error.newPassword && (
                  <p className="text-red-600 text-sm">{error.newPassword}</p>
                )}
              </div>

              <input
                id="newPasswordAgainInput"
                className="w-full px-4 py-3 mb-1 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="再次輸入新密碼"
                type="password"
                value={newPasswordAgain}
                onChange={(e) => setNewPasswordAgain(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, "newPasswordAngin")}
              />

              <div className="w-full flex justify-between items-center mb-6">
                <div></div>
                <div className="text-right">
                  {error.newPasswordAgain && (
                    <p className="text-red-600 text-sm">
                      {error.newPasswordAgain}
                    </p>
                  )}
                  {error.passwordNotEqquals && (
                    <p className="text-red-600 text-sm">
                      {error.passwordNotEqquals}
                    </p>
                  )}
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

              {message && (
                <p className="text-red-600 text-sm mt-4 text-center">
                  {message}
                </p>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg w-full text-center">
                <p className="font-semibold">密碼更新成功</p>
              </div>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-300"
                onClick={() => togglePage("loginPage")}
              >
                返回登入
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChangePasswordWrapper;
