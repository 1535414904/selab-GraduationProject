/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */
import AccountMgrWrapper from "./accountManagement/AccountMgrWrapper";
import DepartmentMgrWrapper from "./departmentManagement/DepartmentMgrWrapper";
import UserProfile from "./UserProfile";
import Gantt from "./Gantt/src/Gantt";
import MainGantt from "./Gantt/src/MainGantt";
import { useState } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import { handleDragEnd } from "./Gantt/src/components/DragDrop/dragEndHandler";
import ORMgrWrapper from "./ORManagement/ORMgrWrapper";
import SurgeryMgrWrapper from "./surgeryManagement/surgeryMgrWrapper";

function MainWrapper({ user, mainState, onUpdateUser, reloadKey, setReloadKey, nowUsername }) {
  const [rows, setRows] = useState([]);

  const onDragEnd = (result) => {
    handleDragEnd(result, rows, setRows);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex flex-col w-full min-h-screen bg-gray-100">
        <style jsx global>{`
          .react-beautiful-dnd-dragging {
            z-index: 9999 !important;
          }
        `}</style>
        <div className="flex-grow p-4 md:p-6">
          {mainState === "mainPage" && (
            <div className="transition-all duration-300 ease-in-out">
              <MainGantt rows={rows} setRows={setRows} />
            </div>
          )}

          {mainState === "userProfile" && (
            <div className="transition-all duration-300 ease-in-out">
              <UserProfile user={user} onUpdateUser={onUpdateUser} />
            </div>
          )}

          {mainState === "accountMgr" && (
            <div className="transition-all duration-300 ease-in-out">
              <AccountMgrWrapper
                user={user}
                onUpdateUser={onUpdateUser}
                reloadKey={reloadKey}
              />
            </div>
          )}

          {mainState === "departmentMgr" && (
            <div className="transition-all duration-300 ease-in-out">
              <DepartmentMgrWrapper reloadKey={reloadKey} />
            </div>
          )}

          {mainState === "ORMgr" && (
            <div className="transition-all duration-300 ease-in-out">
              <ORMgrWrapper reloadKey={reloadKey} />
            </div>
          )}

          {mainState === "surgeryMgr" && (
            <div className="transition-all duration-300 ease-in-out">
              <SurgeryMgrWrapper reloadKey={reloadKey} setReloadKey={setReloadKey} nowUsername={nowUsername}/>
            </div>
          )}

          {mainState === "shiftMgr" && (
            <div className="transition-all duration-300 ease-in-out">
              <Gantt rows={rows} setRows={setRows} />
            </div>
          )}
        </div>
      </div>
    </DragDropContext>
  );
}

export default MainWrapper;
