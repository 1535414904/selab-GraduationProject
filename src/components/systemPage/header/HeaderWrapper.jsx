import UserList from "./UserList";

/* eslint-disable react/prop-types */
function HeaderWrapper({ fullTogglePage, user, toggleMainPage, setReloadKey}) {
  return (
    <div className="header-wrapper">
      <button className="front-page-button" onClick={() => toggleMainPage("mainPage")}>首頁</button>
      {user.role == 3 && <button className="header-button" onClick={() => {toggleMainPage("accountMgr"); setReloadKey(prevKey => prevKey + 1);}}>帳號管理</button>}
      {user.role == 3 && <button className="header-button" onClick={() => {toggleMainPage("departmentMgr"); setReloadKey(prevKey => prevKey + 1);}}>科別管理</button>}
      {user.role == 3 && <button className="header-button" onClick={() => {toggleMainPage("accountMgr"); setReloadKey(prevKey => prevKey + 1);}}>手術房管理</button>}
      {user.role == 3 && <button className="header-button" onClick={() => {toggleMainPage("accountMgr"); setReloadKey(prevKey => prevKey + 1);}}>手術管理</button>}
      {user.role == 3 && <button className="header-button" onClick={() => {toggleMainPage("accountMgr"); setReloadKey(prevKey => prevKey + 1);}}>排班管理</button>}
      <UserList fullTogglePage={fullTogglePage} name={user.name} toggleMainPage={toggleMainPage}/>
    </div>
  );
}

export default HeaderWrapper;
