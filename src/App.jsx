import { useEffect, useState } from "react";
import "./App.css";
import LoginPageWrapper from "./components/loginPage/LoginPageWrapper";
import SystemWrapper from "./components/systemPage/SystemWrapper";
import MainWrapper from "./components/systemPage/main/MainWrapper";
import HeaderWrapper from "./components/systemPage/header/HeaderWrapper";
import { Route, Routes } from "react-router-dom";

function App() {
  // const [pageState, setPageState] = useState("systemPage");
  const [nowUsername, setNowUsername] = useState("");
  // const [mainState, setMainState] = useState("mainPage");
  // const [reloadKey, setReloadKey] = useState(0);

  // return (
  //   <>
  //     {pageState === "loginPage" && (
  //       <LoginPageWrapper
  //         fullTogglePage={setPageState}
  //         nowUsername={nowUsername}
  //         setNowUsername={setNowUsername}
  //       />
  //     )}
  //     {pageState === "systemPage" && (
  //       <SystemWrapper
  //         fullTogglePage={setPageState}
  //         nowUsername={nowUsername}
  //       />
  //     )}
  //   </>
  // );

  // 從 localStorage 讀取 saved username
  useEffect(() => {
    const savedUsername = localStorage.getItem("nowUsername");
    if (savedUsername) {
      setNowUsername(savedUsername);
    }
  }, []);

  // 儲存 nowUsername 到 localStorage
  const handleSetNowUsername = (username) => {
    setNowUsername(username);
    localStorage.setItem("nowUsername", username);
  };

  return (
    <Routes>
      <Route path="/" element={<LoginPageWrapper nowUsername={nowUsername} setNowUsername={handleSetNowUsername} />} />
      <Route path="/system" element={<SystemWrapper nowUsername={nowUsername} />} />
    </Routes>
  );
}

export default App;
