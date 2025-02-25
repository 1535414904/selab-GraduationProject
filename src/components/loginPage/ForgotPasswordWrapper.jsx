/* eslint-disable react/prop-types */
import axios from "axios";
import { useEffect, useState } from "react";
import { BASE_URL } from "../../config";

function ForgotPasswordWrapper({togglePage, setNowUsername}){
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const [error, setError] = useState({
        username: "",
        email: ""
    });

    const confirmHandler = () => {
        let notEmpty = true;
        const newError = { username:"", email:"" };

        if(!username.trim()){
            newError.username = "*請輸入帳號";
            notEmpty = false;
        }

        if(!email.trim()){
            newError.email = "*請輸入信箱"
            notEmpty = false;
        }

        setError(newError);

        if (notEmpty) {
            forgotPasswordHandler();
        }
    }

    const forgotPasswordHandler = async () => {
        try{
            const response = await axios.post(`${BASE_URL}/api/login/ForgotPassword`, {
                username,
                email
            });
            
            setMessage(response.data);  
        // eslint-disable-next-line no-unused-vars
        }catch(error){
            setMessage("Error during to find email");
        }
    }

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
    
    return <div className="login-wrapper">

        <h1 className="title">手術排班網站</h1>
        <h1 className="title">忘記密碼</h1>

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
        id="emailInput"
        className="login-input"
        placeholder="電子信箱"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => handleKeyDown(e, "email")}/>
        
        <div className="error-forgot-container">
            <div></div>
            {error.email && <p className="error">{error.email}</p>}
            {message && <p className="error">{message}</p>}
        </div>

        <button 
        id="confirmButton"
        className="confirm" 
        onClick={confirmHandler}
        onKeyDown={(e) => handleKeyDown(e, "button")}>確認</button>
        
    </div>
}

export default ForgotPasswordWrapper;