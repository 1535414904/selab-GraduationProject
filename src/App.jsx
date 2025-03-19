import { useState } from "react";
import "./App.css";
import LoginPageWrapper from "./components/loginPage/LoginPageWrapper";
import SystemWrapper from "./components/systemPage/SystemWrapper";
import MainWrapper from "./components/systemPage/main/MainWrapper";
import HeaderWrapper from "./components/systemPage/header/HeaderWrapper";

function App() {
  const [pageState, setPageState] = useState("systemPage");
  const [nowUsername, setNowUsername] = useState("OuO");
  const [mainState, setMainState] = useState("mainPage");
  const [reloadKey, setReloadKey] = useState(0);

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
