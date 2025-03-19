import React, { useRef, useEffect, useState } from "react";
import RoomSection from "./components/ROOM/RoomSection";
import TimeWrapper from "./components/Time/timeWrapper";
import GeneratePDFButton from "./components/Time/GeneratePDFButton";
import { fetchSurgeryData } from "./components/Data/ganttData";
import "./styles.css";
import GanttFilter from "./components/GanttFilter";
import { DragDropContext } from "react-beautiful-dnd";
import { handleDragEnd, updateSurgeryInDatabase } from "./components/DragDrop/dragEndHandler";
import SurgeryModal from "./components/Modal/SurgeryModal";
import axios from "axios";
import { BASE_URL } from "/src/config";

// 主頁專用的甘特圖組件，預設只能查看，但可以切換到編輯模式
function MainGantt({ rows, setRows }) {
  const ganttChartRef = useRef(null);
  const timeScaleRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [filteredRows, setFilteredRows] = useState([]); // 儲存篩選後的結果
  const [readOnly, setReadOnly] = useState(true); // 預設為唯讀模式
  const [selectedSurgery, setSelectedSurgery] = useState(null); // 選中的手術
  const [modalError, setModalError] = useState(null); // 模態視窗錯誤
  const [hasChanges, setHasChanges] = useState(false); // 是否有未保存的變更
  const [isSaving, setIsSaving] = useState(false); // 是否正在保存
  const [showConfirmDialog, setShowConfirmDialog] = useState(false); // 是否顯示確認對話框

  // 初始化數據
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        await fetchSurgeryData(setRows, setLoading, setError);
      } catch (error) {
        console.error("初始化數據失敗:", error);
        setError("初始化數據失敗");
        setLoading(false);
      }
    };
    
    initializeData();
  }, []);

  // 當原始數據變更時，更新篩選後的結果
  useEffect(() => {
    setFilteredRows(rows);
  }, [rows]);

  useEffect(() => {
    const handleResize = () => {
      if (scrollContainerRef.current) {
        setContainerWidth(scrollContainerRef.current.clientWidth);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 處理篩選結果
  const handleFilterChange = (filteredData) => {
    setFilteredRows(filteredData);
  };
  
  // 處理拖曳結束事件
  const onDragEnd = async (result) => {
    if (!result.destination || readOnly) return;
    
    // 檢查是否有釘選的手術房
    const sourceRoomIndex = parseInt(result.source.droppableId.split("-")[1], 10);
    const destinationRoomIndex = parseInt(result.destination.droppableId.split("-")[1], 10);
    
    const sourceRoom = filteredRows[sourceRoomIndex];
    const destRoom = filteredRows[destinationRoomIndex];
    
    if (sourceRoom.isPinned || destRoom.isPinned) {
      console.warn("無法移動釘選的手術房中的手術");
      return;
    }
    
    // 執行拖曳處理 - 只更新前端界面，不發送後端請求
    await handleDragEnd(result, filteredRows, setFilteredRows);
    
    // 標記有未保存的變更
    setHasChanges(true);
    
    console.log('手術位置已在界面上更新，但未保存到後端');
  };

  // 切換編輯模式
  const toggleEditMode = () => {
    // 如果要從編輯模式切換到唯讀模式，且有未保存的變更，則顯示確認對話框
    if (!readOnly && hasChanges) {
      setShowConfirmDialog(true);
    } else {
      // 否則直接切換模式
      setReadOnly(!readOnly);
      // 如果是從唯讀模式切換到編輯模式，重置變更狀態
      if (readOnly) {
        setHasChanges(false);
      }
    }
  };
  
  // 確認保存變更
  const confirmSaveChanges = async () => {
    setIsSaving(true);
    let successCount = 0;
    let errorCount = 0;
    
    try {
      // 遍歷所有手術房，更新每個手術的資料
      const updatePromises = [];
      
      for (const roomIndex in filteredRows) {
        if (filteredRows[roomIndex].data && filteredRows[roomIndex].data.length > 0) {
          // 使用更新後的 updateSurgeryInDatabase 函數更新每個手術房的數據
          const updatePromise = updateSurgeryInDatabase(filteredRows, parseInt(roomIndex))
            .then(results => {
              if (results) {
                successCount += results.length;
              }
              return results;
            })
            .catch(error => {
              console.error(`更新手術室 ${roomIndex} 失敗:`, error);
              errorCount++;
              return null;
            });
          
          updatePromises.push(updatePromise);
        }
      }
      
      // 等待所有更新完成
      await Promise.all(updatePromises);
      
      // 更新成功後，重置狀態
      setHasChanges(false);
      setShowConfirmDialog(false);
      setReadOnly(true);
      
      // 顯示成功訊息
      if (errorCount === 0) {
        alert(`所有變更已成功保存到資料庫！共更新了 ${successCount} 個手術。`);
      } else {
        alert(`部分變更已保存到資料庫。成功: ${successCount} 個，失敗: ${errorCount} 個。`);
      }
      
      // 重新載入資料以確保顯示最新狀態
      await fetchSurgeryData(setRows, setLoading, setError);
      
    } catch (error) {
      console.error('保存變更時發生錯誤:', error);
      alert(`保存變更失敗: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  // 取消保存變更，重新載入原始資料
  const cancelSaveChanges = async () => {
    setShowConfirmDialog(false);
    
    // 詢問用戶是否要放棄變更
    const confirmDiscard = window.confirm('確定要放棄所有未保存的變更嗎？這將重新載入原始資料。');
    
    if (confirmDiscard) {
      setLoading(true);
      try {
        // 重新載入原始資料
        await fetchSurgeryData(setRows, setLoading, setError);
        setHasChanges(false);
        setReadOnly(true);
      } catch (error) {
        console.error('重新載入資料失敗:', error);
        setError('重新載入資料失敗');
      } finally {
        setLoading(false);
      }
    }
  };

  // 處理手術房釘選狀態變更
  const handleRoomPinStatusChange = (roomIndex, isPinned) => {
    if (readOnly) return; // 唯讀模式下不允許釘選
    
    const updatedRows = [...filteredRows];
    updatedRows[roomIndex] = {
      ...updatedRows[roomIndex],
      isPinned: isPinned
    };
    setFilteredRows(updatedRows);
    setHasChanges(true);
  };
  
  // 處理手術點擊事件，顯示詳細資訊
  const handleSurgeryClick = (surgery) => {
    setSelectedSurgery(surgery);
    setModalError(null);
  };
  
  // 關閉模態視窗
  const handleCloseModal = () => {
    setSelectedSurgery(null);
  };
  
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    setCurrentDate(formattedDate);
  }, []);
  
  // 如果數據尚未載入，顯示載入中
  if (loading) {
    return (
      <div className="gantt-main-container">
        <div className="loading">
          <p>載入中，請稍候...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gantt-main-container">
      {/* ✅ 上方資訊區塊 */}
      <div className="gantt-header">
        <div className="gantt-title">
        <div className="gantt-date">
          <h2 className="gantt-title-text">{currentDate}手術排程甘特圖</h2>
          <p className="gantt-subtitle">顯示所有手術室的排程安排</p>
        </div>
      </div>

        {/* ✅ 手術室數量、編輯模式按鈕 & PDF 按鈕 */}
        <div className="gantt-actions">
          <div className="gantt-room-count">
            <svg className="gantt-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="gantt-room-count-text">共 {filteredRows.length} 間手術室</span>
          </div>
          
          <div className="gantt-buttons">
            <button 
              className={`edit-mode-button ${!readOnly ? 'active' : ''}`} 
              onClick={toggleEditMode}
              disabled={isSaving}
            >
              {readOnly ? '啟用移動修改' : '關閉移動修改'}
            </button>
            <GeneratePDFButton timeScaleRef={timeScaleRef} ganttChartRef={ganttChartRef} />
          </div>
        </div>
      </div>

      {/* ✅ 使用提示 */}
    <div className="gantt-tips">
      <svg 
        className="gantt-tips-icon" 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        width="20" 
        height="20" 
        fill="currentColor"
      >
        <circle cx="12" cy="12" r="10" fill="#3B82F6" />
        <circle cx="12" cy="7" r="1.5" fill="white" />
        <rect x="11" y="9.5" width="2" height="6" rx="1" fill="white" />
      </svg>
      <div className="gantt-tips-content">
        <p className="gantt-tips-title">使用提示</p>
        <ul className="gantt-tips-list">
          <li>可以橫向滾動查看不同時間段的排程</li>
          <li>點擊「生成 PDF」按鈕可將當前甘特圖生成 PDF 檔案</li>
          <li>點擊「啟用移動修改」按鈕可臨時調整排程位置</li>
          <li>點擊手術項目可查看詳細資訊</li>
          {!readOnly && <li>完成修改後，點擊「關閉移動修改」按鈕時可選擇保存變更</li>}
        </ul>
      </div>
    </div>

      {/* 確認對話框 */}
      {showConfirmDialog && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog">
            <h3 className="confirm-dialog-title">保存變更</h3>
            <p className="confirm-dialog-message">您有未保存的變更，是否要保存到資料庫？</p>
            <div className="confirm-dialog-buttons">
              <button 
                className="confirm-dialog-button confirm-dialog-save" 
                onClick={confirmSaveChanges}
                disabled={isSaving}
              >
                {isSaving ? '保存中...' : '保存變更'}
              </button>
              <button 
                className="confirm-dialog-button confirm-dialog-discard" 
                onClick={cancelSaveChanges}
                disabled={isSaving}
              >
                放棄變更
              </button>
              <button 
                className="confirm-dialog-button confirm-dialog-cancel" 
                onClick={() => setShowConfirmDialog(false)}
                disabled={isSaving}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ 篩選器放在提示下方 */}
      <GanttFilter 
        originalRows={rows} 
        onFilteredDataChange={handleFilterChange} 
      />

      {/* ✅ 手術排程內容 */}
      {!loading && !error && filteredRows.length > 0 && (
        <div className="gantt-content">
          <div ref={scrollContainerRef} className="scroll-container">
            <div ref={timeScaleRef} className="gantt-timescale-container">
              <TimeWrapper containerWidth={containerWidth}>
                <div ref={ganttChartRef} className="gantt-chart-container">
                  <DragDropContext onDragEnd={onDragEnd}>
                    <div className="gantt-chart">
                      {filteredRows.map((room, roomIndex) => (
                        <div 
                          key={room.room || roomIndex} 
                          className={`row ${roomIndex % 2 === 0 ? "row-even" : "row-odd"} ${room.isPinned ? 'row-pinned' : ''}`}
                        >
                          <RoomSection 
                            room={room} 
                            roomIndex={roomIndex} 
                            readOnly={readOnly}
                            onPinStatusChange={handleRoomPinStatusChange}
                            onSurgeryClick={handleSurgeryClick}
                          />
                        </div>
                      ))}
                    </div>
                  </DragDropContext>
                </div>
              </TimeWrapper>
            </div>
          </div>
        </div>
      )}

      {/* ✅ 當篩選後無符合的資料 */}
      {!loading && !error && filteredRows.length === 0 && (
        <div className="no-data">
          <p className="no-data-title">尚無符合條件的排程資料</p>
          <p className="no-data-subtitle">請更改篩選條件或稍後再試</p>
        </div>
      )}
      
      {/* 手術詳細資訊模態視窗 */}
      {selectedSurgery && (
        <SurgeryModal 
          surgery={selectedSurgery} 
          onClose={handleCloseModal} 
          error={modalError}
        />
      )}
    </div>
  );
}

export default MainGantt;
