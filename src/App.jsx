import { useState } from "react";
import "./App.css";
import LoginPageWrapper from "./components/loginPage/LoginPageWrapper";
import SystemWrapper from "./components/systemPage/SystemWrapper";

function App() {
  const [pageState, setPageState] = useState("loginPage");
  const [nowUsername, setNowUsername] = useState("");

  return (
    <>
      {pageState === "loginPage" && (
        <LoginPageWrapper
          fullTogglePage={setPageState}
          nowUsername={nowUsername}
          setNowUsername={setNowUsername}
        />
      )}
      {pageState === "systemPage" && (
        <SystemWrapper
          fullTogglePage={setPageState}
          nowUsername={nowUsername}
        />
      )}
    </>
  );
}

export default App;
