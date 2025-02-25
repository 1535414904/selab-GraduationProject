/* eslint-disable react/prop-types */
import AccountMgrWrapper from "./accountManagement/AccountMgrWrapper";
import DepartmentMgrWrapper from "./departmentManagement/DepartmentMgrWrapper";
import UserProfile from "./UserProfile";

function MainWrapper({user, mainState, onUpdateUser, reloadKey}){

    return <div className="main-wrapper">
        {mainState == "mainPage" && <div />}
        {mainState == "userProfile" && <UserProfile user={user} onUpdateUser={onUpdateUser}/>}
        {mainState == "accountMgr" && <AccountMgrWrapper reloadKey={reloadKey}/>}
        {mainState == "departmentMgr" && <DepartmentMgrWrapper reloadKey={reloadKey}/>}
    </div>
}

export default MainWrapper;