/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { BASE_URL } from "../../config";
import HeaderWrapper from "./header/HeaderWrapper";
import "./SystemPage.css";
import axios from "axios";
import MainWrapper from "./main/MainWrapper";
import { useNavigate } from "react-router-dom";


function SystemWrapper({ fullTogglePage, nowUsername }) {

  const [user, setUser] = useState([]);
  const [error, setError] = useState("");
  const [mainState, setMainState] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/system/user/${nowUsername}`);
        console.log(response.data);
        //response.data.user.name = response.data.user.username;
        setUser(response.data);
        console.log(user);
      } catch {
        setError("Can not find the user.")
      }
    };

    if (nowUsername) {
      fetchUserData();
    }
  }, [nowUsername]);

  useEffect(() => {
    console.log("user", user);
  }, [user]);

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return <div className="system-wrapper">
    <HeaderWrapper fullTogglePage={() => navigate("/")} user={user} toggleMainPage={setMainState} setReloadKey={setReloadKey} />
    <MainWrapper user={user} mainState={mainState} onUpdateUser={setUser} reloadKey={reloadKey} setReloadKey={setReloadKey} nowUsername={nowUsername} />
  </div>
}

export default SystemWrapper;