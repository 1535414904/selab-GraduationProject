import axios from "axios";
import { useEffect, useState } from "react";
import { BASE_URL } from "../../../config";

/* eslint-disable react/prop-types */
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
    1: <p>管理者</p>,
    2: <p>編輯者</p>,
    3: <p>查看者</p>,
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
        password: newPassword }
      );

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

  const handleKeyDown = (e, type) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if(type === "oldPassword") {
        document.getElementById("newPasswordInput").focus();
      } else if (type === "newPassword") {
        document.getElementById("newPasswordAgainInput").focus();
      } else if (type === "newPasswordAgain") {
        confirmHandler();
      } else if (type === "confirm") {
        confirmHandler();
      } else if (type === "cancel") {
        cancelHandler();
      }
    }
  };

  useEffect(() => {
    if (isChangingPassword) {
      document.getElementById("oldPasswordInput").focus();
    }
  }, [isChangingPassword]);

  return (
    <div className="user-profile">
      <h1>個人資料</h1>
      <div className="user-info">帳號 : {user.username}</div>
      <div className="user-info">姓名 : {user.name}</div>
      <div className="user-info">單位 : {user.unit}</div>
      <div className="user-info">權限 : {roleMap[user.role]}</div>
      <div className="user-info">信箱 : {user.email}</div>

      {!isChangingPassword && (
        <>
          <div className="user-info">
            密碼 : {maskedPassword} {passwordChanged && " (已更新)"}
          </div>
          <button
            className="user-profile-button"
            onClick={() => {setChangingPassword(true);}}
          >
            更改密碼
          </button>
        </>
      )}

      {isChangingPassword && (
        <>
          <input
            id="oldPasswordInput"
            className="user-password-input"
            type="password"
            placeholder="請輸入舊密碼"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, "oldPassword")}
          />
          {error.oldPassword && <p className="error">{error.oldPassword}</p>}

          <input
            id="newPasswordInput"
            className="user-password-input"
            type="password"
            placeholder="請輸入新密碼"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, "newPassword")}
          />
          {error.newPassword && <p className="error">{error.newPassword}</p>}

          <input
            id="newPasswordAgainInput"
            className="user-password-input"
            type="password"
            placeholder="請再次輸入新密碼"
            value={newPasswordAgain}
            onChange={(e) => setNewPasswordAgain(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, "newPasswordAgain")}
          />
          {error.newPasswordAgain && (
            <p className="error">{error.newPasswordAgain}</p>
          )}

          <div className="change-button">
            <button
              className="user-profile-button user-confirm"
              onClick={confirmHandler}
              onKeyDown={(e) => handleKeyDown(e, "newPassword")}
            >
              確認
            </button>
            <button
              className="user-profile-button user-cancel"
              onClick={cancelHandler}
            >
              取消
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default UserProfile;
