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
      if (newPassword === newPasswordAgain) {
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
      setMessage("密碼更新時發生錯誤");
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-screen bg-gradient-to-br from-blue-800 via-blue-600 to-blue-400">
      <div className="w-full max-w-md bg-white bg-opacity-95 p-8 rounded-lg shadow-2xl transform transition-all duration-500 hover:scale-105">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">手術排班網站</h1>
        <h1 className="text-2xl font-semibold text-gray-700 mb-6 text-center">更改密碼</h1>

        {!passwordChanged ? (
          <>
            <input
              className="w-full px-4 py-3 mb-3 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:shadow-lg"
              placeholder="新密碼"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            {error.newPassword && <p className="text-red-600 text-sm">{error.newPassword}</p>}

            <input
              className="w-full px-4 py-3 mt-2 mb-3 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:shadow-lg"
              placeholder="再次輸入新密碼"
              type="password"
              value={newPasswordAgain}
              onChange={(e) => setNewPasswordAgain(e.target.value)}
            />
            {error.newPasswordAgain && <p className="text-red-600 text-sm">{error.newPasswordAgain}</p>}
            {error.passwordNotEqquals && <p className="text-red-600 text-sm">{error.passwordNotEqquals}</p>}

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

            {message && (
              <p className="text-red-600 text-sm mt-4 text-center">{message}</p>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg w-full text-center">
              <p className="font-semibold">密碼更新成功</p>
            </div>
            <button
              className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-110 shadow-md"
              onClick={() => togglePage("loginPage")}
            >
              返回登入
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChangePasswordWrapper;