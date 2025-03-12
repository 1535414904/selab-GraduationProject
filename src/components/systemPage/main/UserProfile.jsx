import axios from "axios";
import { useEffect, useState } from "react";
import { BASE_URL } from "../../../config";

function UserProfile({ user, onUpdateUser }) {
  const [maskedPassword, setMaskedPassword] = useState("*".repeat(user.password.length));
  const [isChangingPassword, setChangingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordAgain, setNewPasswordAgain] = useState("");
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [error, setError] = useState({
    oldPassword: "",
    newPassword: "",
    newPasswordAgain: "",
  });

  const roleMap = {
    1: "管理者",
    2: "編輯者",
    3: "查看者",
  };

  const clearInputs = () => {
    setOldPassword("");
    setNewPassword("");
    setNewPasswordAgain("");
    setError({ oldPassword: "", newPassword: "", newPasswordAgain: "" });
  };

  const confirmHandler = () => {
    let notEmpty = true;
    let isSame = false;
    const newError = { oldPassword: "", newPassword: "", newPasswordAgain: "" };

    if (!oldPassword.trim()) {
      newError.oldPassword = "*請輸入舊密碼";
      notEmpty = false;
    } else {
      oldPassword === user.password
        ? (isSame = true)
        : (newError.oldPassword = "*與舊密碼不相符");
    }

    if (!newPassword.trim()) {
      newError.newPassword = "*請輸入新密碼";
      notEmpty = false;
    }

    if (newPassword.trim() && !newPasswordAgain.trim()) {
      newError.newPasswordAgain = "*請再次輸入新密碼";
      notEmpty = false;
    }

    if (notEmpty && isSame) {
      if (newPassword === newPasswordAgain) {
        changePasswordHandler();
      } else {
        newError.newPasswordAgain = "*兩個密碼不相同";
      }
    }

    setError(newError);
  };

  const changePasswordHandler = async () => {
    try {
      const response = await axios.put(`${BASE_URL}/api/login/changePassword/${user.username}`, {
        password: newPassword,
      });

      if (response.data === "Change Password successfully") {
        setMaskedPassword("*".repeat(newPassword.length));
        onUpdateUser({ ...user, password: newPassword });
        setPasswordChanged(true);
        setChangingPassword(false);
        clearInputs();
      }
    } catch (error) {
      console.error("Error changing password:", error);
    }
  };

  const cancelHandler = () => {
    setPasswordChanged(false);
    setChangingPassword(false);
    clearInputs();
  };

  return (
    <div className="flex items-center justify-center w-full h-screen bg-gradient-to-br from-blue-700 via-blue-500 to-blue-300">
      <div className="w-full max-w-md bg-white bg-opacity-95 p-8 rounded-lg shadow-2xl transform transition-all duration-500 hover:scale-105">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">個人資料</h1>

        <div className="space-y-3">
          <p className="text-lg font-medium text-gray-800">帳號：{user.username}</p>
          <p className="text-lg font-medium text-gray-800">姓名：{user.name}</p>
          <p className="text-lg font-medium text-gray-800">單位：{user.unit}</p>
          <p className="text-lg font-medium text-gray-800">權限：{roleMap[user.role]}</p>
          <p className="text-lg font-medium text-gray-800">信箱：{user.email}</p>
          <p className="text-lg font-medium text-gray-800">密碼：{maskedPassword} {passwordChanged && "(已更新)"}</p>
        </div>

        {!isChangingPassword && (
          <button
            className="mt-4 w-full bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md"
            onClick={() => setChangingPassword(true)}
          >
            更改密碼
          </button>
        )}

        {isChangingPassword && (
          <div className="mt-4 space-y-3">
            <input
              className="w-full px-4 py-3 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:shadow-lg"
              type="password"
              placeholder="請輸入舊密碼"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            {error.oldPassword && <p className="text-red-600 text-sm">{error.oldPassword}</p>}

            <input
              className="w-full px-4 py-3 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:shadow-lg"
              type="password"
              placeholder="請輸入新密碼"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            {error.newPassword && <p className="text-red-600 text-sm">{error.newPassword}</p>}

            <input
              className="w-full px-4 py-3 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:shadow-lg"
              type="password"
              placeholder="請再次輸入新密碼"
              value={newPasswordAgain}
              onChange={(e) => setNewPasswordAgain(e.target.value)}
            />
            {error.newPasswordAgain && <p className="text-red-600 text-sm">{error.newPasswordAgain}</p>}

            <div className="flex justify-between w-full mt-4">
              <button
                className="bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-110 shadow-md"
                onClick={confirmHandler}
              >
                確認
              </button>
              <button
                className="bg-gray-400 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-110 shadow-md"
                onClick={cancelHandler}
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfile;
