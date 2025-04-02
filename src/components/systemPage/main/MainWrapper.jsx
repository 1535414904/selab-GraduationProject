/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */
import AccountMgrWrapper from "./accountManagement/AccountMgrWrapper";
import DepartmentMgrWrapper from "./departmentManagement/DepartmentMgrWrapper";
import UserProfile from "./UserProfile";
import Gantt from "./Gantt/src/Gantt";
import MainGantt from "./Gantt/src/MainGantt";
import { useState, useRef, useEffect } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import { handleDragEnd } from "./Gantt/src/components/DragDrop/dragEndHandler";
import ORMgrWrapper from "./ORManagement/ORMgrWrapper";
import SurgeryMgrWrapper from "./surgeryManagement/surgeryMgrWrapper";
import { Route, Routes } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../../config";

function MainWrapper({ user, mainState, onUpdateUser, reloadKey, setReloadKey, nowUsername }) {
  const [rows, setRows] = useState([]);
  // 添加用於存儲MainGantt狀態更新函數的引用
  const mainGanttRef = useRef({
    setHasChanges: null,
    filteredRows: null,
    setFilteredRows: null,
    readOnly: true
  });

  // 使用 useState 儲存初始 timeSettings
  const [initialTimeSettings, setInitialTimeSettings] = useState({
    surgeryStartTime: 510, // 預設 08:30
    regularEndTime: 1050, // 預設 17:30
    overtimeEndTime: 1200, // 預設 20:00
    cleaningTime: 45, // 預設 45 分鐘
  });

  useEffect(() => {
    // 發送請求獲取後端時間設定數據
    const fetchTimeSettings = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/system/algorithm/time-settings`); // 你的 API 地址
        const data = response.data;

        if (data) {
          // 設置 initialTimeSettings 狀態為後端回傳的數據
          setInitialTimeSettings({
            surgeryStartTime: data.surgeryStartTime || 510,
            regularEndTime: data.regularEndTime || 1050,
            overtimeEndTime: data.overtimeEndTime || 1200,
            cleaningTime: data.cleaningTime || 45,
          });
        }
      } catch (error) {
        console.error("獲取時間設定失敗:", error);
      }
    };

    fetchTimeSettings();
  }, []);  // 空依賴陣列，表示這個 effect 只會在組件首次渲染時執行一次

  const onDragEnd = (result) => {
    if (!result.destination) return;

    // 檢查是否為MainGantt並且處於唯讀模式
    if (mainState === "mainPage" && mainGanttRef.current) {
      // 從 mainGanttRef 中獲取最新的狀態
      const { setHasChanges, filteredRows, setFilteredRows, readOnly } = mainGanttRef.current;

      console.log("用戶角色:", user.role);  // 除錯用
      console.log("用戶名稱:", user.username);  // 除錯用

      // 每次拖曳前重新檢查最新的 readOnly 狀態
      console.log("拖曳操作檢查 - readOnly 狀態:", readOnly);

      // 如果是唯讀模式，阻止拖曳操作
      if (readOnly === true) {
        console.warn("唯讀模式下無法拖曳");
        return;
      }

      // 檢查拖曳來源和目標是否為有效的房間
      try {
        const sourceRoomIndex = parseInt(result.source.droppableId.split("-")[1], 10);
        const destinationRoomIndex = parseInt(result.destination.droppableId.split("-")[1], 10);

        // 如果有 filteredRows (MainGantt使用)，則使用它
        if (filteredRows && setFilteredRows) {
          const sourceRoom = filteredRows[sourceRoomIndex];
          const destRoom = filteredRows[destinationRoomIndex];

          // 檢查是否有釘選的手術房
          if (sourceRoom && destRoom && (sourceRoom.isPinned || destRoom.isPinned)) {
            console.warn("無法移動釘選的手術房中的手術");
            return;
          }

          // 執行拖曳處理 - 使用 MainGantt 的過濾後的行
          console.log("開始處理拖曳操作...");
          const updatedResult = handleDragEnd(result, filteredRows, setFilteredRows);

          // 確保原始的rows也被更新，以保持同步
          if (updatedResult && updatedResult.updatedRows) {
            const newRows = updatedResult.updatedRows;
            setRows(newRows);
            setFilteredRows(newRows);
            console.log("已更新rows和filteredRows");

            // 使用直接修改而不是替換，保留其他屬性
            if (mainGanttRef.current) {
              mainGanttRef.current.filteredRows = newRows;
            }

            // 強制設置 hasChanges 為 true
            console.log("拖曳完成 - 強制設置 hasChanges 為 true");
            if (typeof setHasChanges === 'function') {
              setHasChanges(true);
              console.log("已通過 setHasChanges 函數設置為 true");
            }

            // 同時直接修改 mainGanttRef 中的 hasChanges
            if (mainGanttRef.current) {
              mainGanttRef.current.hasChanges = true;
              console.log("已直接設置 mainGanttRef.current.hasChanges 為 true");
            }
          }

          return;
        }
      } catch (error) {
        console.error("處理拖曳時發生錯誤:", error);
      }
    }
    // 處理 Gantt (排班管理) 的拖曳
    else if (mainState === "shiftMgr") {
      // 首先嘗試解析拖曳源和目標索引
      try {
        const sourceRoomIndex = parseInt(result.source.droppableId.split("-")[1], 10);
        const destinationRoomIndex = parseInt(result.destination.droppableId.split("-")[1], 10);

        // 檢查是否有釘選的手術房
        const sourceRoom = rows[sourceRoomIndex];
        const destRoom = rows[destinationRoomIndex];

        if (sourceRoom && destRoom && (sourceRoom.isPinned || destRoom.isPinned)) {
          console.warn("無法移動釘選的手術房中的手術");
          return;
        }
      } catch (error) {
        console.error("解析拖曳索引時出錯:", error);
      }
    }

    // 預設行為 - 用於 Gantt 組件或其他情況
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
          <Routes>
            <Route path="/main" element={<MainGantt rows={rows} setRows={setRows} mainGanttRef={mainGanttRef} user={user} />} />
            <Route path="/user-profile" element={<UserProfile user={user} onUpdateUser={onUpdateUser} />} />
            <Route path="/account-mgr" element={<AccountMgrWrapper user={user} onUpdateUser={onUpdateUser} reloadKey={reloadKey} />} />
            <Route path="/department-mgr" element={<DepartmentMgrWrapper reloadKey={reloadKey} />} />
            <Route path="/OR-mgr" element={<ORMgrWrapper reloadKey={reloadKey} />} />
            <Route path="/surgery-mgr" element={<SurgeryMgrWrapper reloadKey={reloadKey} setReloadKey={setReloadKey} nowUsername={nowUsername} />} />
            <Route path="/shift-mgr" element={<Gantt rows={rows} setRows={setRows} initialTimeSettings={initialTimeSettings} setInitialTimeSettings={setInitialTimeSettings} />} />
          </Routes>
        </div>
      </div>
    </DragDropContext>
  );
}

export default MainWrapper;
