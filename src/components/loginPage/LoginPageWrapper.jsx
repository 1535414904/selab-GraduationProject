/* eslint-disable react/prop-types */
import LoginWrapper from "./LoginWrapper";
import "./LoginPage.css"
import { useState } from "react";
import ForgotPasswordWrapper from "./ForgotPasswordWrapper";
import ChangePasswordWrapper from "./ChangePasswordWrapper";

function LoginPageWrapper({fullTogglePage, nowUsername, setNowUsername}) {
    const [pageState, setPageState] = useState("loginPage");

    return <>
        {pageState === "loginPage" && (
            <LoginWrapper togglePage={setPageState} fullTogglePage={fullTogglePage} setNowUsername={setNowUsername}/>
        )}
        {pageState === "forgotPasswordPage" && (
            <ForgotPasswordWrapper togglePage={setPageState} setNowUsername={setNowUsername}/>
        )}
        {pageState === "changePasswordPage" && (
            <ChangePasswordWrapper togglePage={setPageState} username={nowUsername} />
        )}
    </>
}

export default LoginPageWrapper;