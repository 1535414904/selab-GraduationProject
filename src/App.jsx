import { useState } from 'react'
import LoginPageWrapper from './components/loginPage/LoginPageWrapper'
import SystemWrapper from './components/systemPage/SystemWrapper';



function App() {
  const [pageState, setPageState] = useState("systemPage");
  const [nowUsername, setNowUsername] = useState("OuO");

  return <>
    {pageState === "loginPage" && (
      <LoginPageWrapper fullTogglePage={setPageState} nowUsername={nowUsername} setNowUsername={setNowUsername}/>
    )}
    {pageState === "systemPage" && (
      <SystemWrapper fullTogglePage={setPageState} nowUsername={nowUsername}/>
    )}
  </>
}

export default App
