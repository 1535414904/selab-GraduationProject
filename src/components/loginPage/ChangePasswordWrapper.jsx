/* eslint-disable react/prop-types */
import axios from "axios";
import { useState } from "react";
import { BASE_URL } from "../../config";

function ChangePasswordWrapper({togglePage, username}){
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordAgain, setNewPasswordAgain] = useState("");
    const [message, setMessage] = useState("");
    const [passwordChanged, setPasswordChanged] = useState(false);

    const [error, setError] = useState({
        newPassword: "",
        newPasswordAgain: "",
        passwordNotEqquals: ""
    });

    const confirmHandler = () => {
        console.log("nowusername:", username);
        let notEmpty = true;
        const newError = { newPassword:"", newPasswordAgain:"", passwordNotEqquals: "" };

        if(!newPassword.trim()){
            newError.newPassword = "*請輸入新密碼";
            notEmpty = false;
        }

        if(newPassword.trim() && !newPasswordAgain.trim()){
            newError.newPasswordAgain = "*請再次輸入新密碼";
            notEmpty = false;
        }

        if (notEmpty) {
            if(newPassword == newPasswordAgain){
                changePasswordHandler();
            }else {
                newError.passwordNotEqquals = "*兩個密碼不相同";
            }
        }

        setError(newError); 
    }

    const changePasswordHandler = async () => {
        try{
            const response = await axios.put(`${BASE_URL}/api/login/changePassword/${username}`, {
                password: newPassword
            });
            setMessage(response.data);
            if(response.data === "Change Password successfully"){
                setPasswordChanged(true);
            }
        }catch {
            setMessage("Error during to check password");
        }
    }

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
    
    return <div className="login-wrapper">

        <h1 className="title">手術排班網站</h1>
        <h1 className="title">更改密碼</h1>

        <input 
        id="newPasswordInput"
        className="login-input"
        placeholder="新密碼" 
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        onKeyDown={(e) => handleKeyDown(e, "newPassword")}/>

        <div className="error-forgot-container">
            <div></div>
            {error.newPassword && <p className="error">{error.newPassword}</p>}
        </div>

        <input 
        id="newPasswordAgainInput"
        className="login-input"
        placeholder="再次輸入新密碼"
        value={newPasswordAgain}
        onChange={(e) => setNewPasswordAgain(e.target.value)}
        onKeyDown={(e) => handleKeyDown(e, "newPasswordAngin")}/>
        
        <div className="error-forgot-container">
            <div></div>
            {error.newPasswordAgain && <p className="error">{error.newPasswordAgain}</p>}
            {error.passwordNotEqquals && <p className="error">{error.passwordNotEqquals}</p>}
        </div>

        <button 
        id="confirmButton"
        className="confirm" 
        onClick={confirmHandler}
        onKeyDown={(e) => handleKeyDown(e, "button")}>確認</button>

        {message && <p className="error">{message}</p>}
        
        {passwordChanged && <div className="back-to-loginpage">
            <h1 className="title">密碼更新成功</h1>
            <button className="confirm" onClick={() => togglePage("loginPage")}>確認</button>
        </div>}
        

    </div>
}

export default ChangePasswordWrapper;