/* eslint-disable react/prop-types */
import AccountMgrWrapper from "./accountManagement/AccountMgrWrapper";
import DepartmentMgrWrapper from "./departmentManagement/DepartmentMgrWrapper";
import UserProfile from "./UserProfile";
import Gantt from "./Gantt/src/Gantt";
import { useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import { handleDragEnd } from "./Gantt/src/components/DragDrop/dragEndHandler";

/*function MainWrapper({user, mainState, onUpdateUser, reloadKey}){

    return <div className="main-wrapper">
        {mainState == "mainPage" && <div />}
        {mainState == "userProfile" && <UserProfile user={user} onUpdateUser={onUpdateUser}/>}
        {mainState == "accountMgr" && <AccountMgrWrapper reloadKey={reloadKey}/>}
        {mainState == "departmentMgr" && <DepartmentMgrWrapper reloadKey={reloadKey}/>}
    </div>
}*/

function MainWrapper({ user, mainState, onUpdateUser, reloadKey }) {
    const [rows, setRows] = useState([]);

    const onDragEnd = (result) => {
        handleDragEnd(result, rows, setRows);
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="main-wrapper">
                {mainState === "mainPage" && (
                    <Gantt 
                        rows={rows} 
                        setRows={setRows}
                    />
                )}
                {mainState === "userProfile" && (
                    <UserProfile user={user} onUpdateUser={onUpdateUser} />
                )}
                {mainState === "accountMgr" && (
                    <AccountMgrWrapper user={user} onUpdateUser={onUpdateUser} reloadKey={reloadKey} />
                )}
                {mainState === "departmentMgr" && (
                    <DepartmentMgrWrapper reloadKey={reloadKey} />
                )}
            </div>
        </DragDropContext>
    );
}



export default MainWrapper;