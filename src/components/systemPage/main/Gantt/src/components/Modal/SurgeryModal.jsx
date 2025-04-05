import React, { useEffect, useState } from "react";
import "./SurgeryModal.css";

function SurgeryModal({ surgery, onClose, error }) {
  if (!surgery) return null;
  
  // 添加狀態來追蹤當前顯示的群組手術索引
  const [currentSurgeryIndex, setCurrentSurgeryIndex] = useState(0);
  
  // 檢查是否為群組手術
  const isGroupSurgery = surgery.isGroup && surgery.surgeries && surgery.surgeries.length > 0;
  console.log('是否為群組手術:', isGroupSurgery, surgery);
  
  // 獲取非清潔時間的手術
  const nonCleaningSurgeries = isGroupSurgery 
    ? surgery.surgeries.filter(s => !s.isCleaningTime) 
    : [];
  
  console.log('群組中的實際手術數量:', nonCleaningSurgeries.length);
  
  // 確定要顯示的手術資訊
  // 如果是群組手術，則顯示群組中的特定手術；否則直接顯示傳入的手術
  const displaySurgery = isGroupSurgery && nonCleaningSurgeries.length > 0
    ? nonCleaningSurgeries[currentSurgeryIndex] || surgery 
    : surgery;
  
  // 計算群組中的實際手術數量（排除銜接時間）
  const totalSurgeries = nonCleaningSurgeries.length;

  // 確定是否顯示釘選狀態
  // 從顯示的手術或父群組獲取釘選狀態
  const isPinned = displaySurgery.isPinned || surgery.isPinned;

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscKey);
    
    // 在掛載時進行調試輸出
    if (isGroupSurgery) {
      console.log('群組手術資訊:', {
        總數: surgery.surgeries.length,
        非清潔時間手術數: nonCleaningSurgeries.length,
        當前索引: currentSurgeryIndex,
        釘選狀態: isPinned
      });
    }

    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleEscKey);
    };
  }, [onClose, isGroupSurgery, surgery, nonCleaningSurgeries, currentSurgeryIndex, isPinned]);

  const formatDate = (dateValue) => {
    if (!dateValue) return '未指定';
    
    try {
      if (typeof dateValue === 'string') {
        return dateValue;
      } else {
        return new Date(dateValue).toLocaleDateString();
      }
    } catch (error) {
      console.error('日期格式化錯誤:', error);
      return '日期格式錯誤';
    }
  };

  const formatTime = (time) => {
    if (!time) return '未指定';
    
    try {
      const [hours, minutes] = time.split(":").map(Number);
      if (hours >= 24) {
        const adjustedHours = hours - 24;
        return `${String(adjustedHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      }
      return time;
    } catch (error) {
      console.error('時間格式化錯誤:', error);
      return time;
    }
  };

  const getOperatingRoomName = () => {
    return displaySurgery.operatingRoomName || surgery.operatingRoomName || '未指定';
  };
  
  // 導航到上一個手術
  const goToPreviousSurgery = () => {
    if (isGroupSurgery && totalSurgeries > 0) {
      setCurrentSurgeryIndex(prev => {
        const newIndex = (prev - 1 + totalSurgeries) % totalSurgeries;
        console.log('導航到上一個手術:', newIndex);
        return newIndex;
      });
    }
  };
  
  // 導航到下一個手術
  const goToNextSurgery = () => {
    if (isGroupSurgery && totalSurgeries > 0) {
      setCurrentSurgeryIndex(prev => {
        const newIndex = (prev + 1) % totalSurgeries;
        console.log('導航到下一個手術:', newIndex);
        return newIndex;
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>手術詳細資訊</h2>
          
          {/* 顯示群組手術導航控制項 */}
          {isGroupSurgery && totalSurgeries > 1 && (
            <div className="group-navigation">
              <button onClick={goToPreviousSurgery} className="nav-button">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <span className="nav-indicator">{`${currentSurgeryIndex + 1}/${totalSurgeries}`}</span>
              <button onClick={goToNextSurgery} className="nav-button">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="20" height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          )}
          
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <p>顯示的可能是部分資料或舊資料</p>
          </div>
        )}

        {isGroupSurgery && (
          <div className="info-banner bg-blue-50 border-l-4 border-blue-500 p-3 mx-4 mt-4">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="20" height="20" className="text-blue-600 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
              </svg>
              <p className="text-sm text-blue-700">此為群組手術，使用右上角箭頭查看各個手術詳細資訊</p>
            </div>
          </div>
        )}

        {isPinned && (
          <div className="info-banner bg-red-50 border-l-4 border-red-500 p-3 mx-4 mt-4">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20" className="text-red-600 mr-2">
                <path d="M16 9V4h1c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z" />
              </svg>
              <p className="text-sm text-red-700">此手術房已被釘選，手術排程無法移動</p>
            </div>
          </div>
        )}

        <div className="modal-body">
          <div className="info-group blue">
            <h3 className="text-blue-600">基本資訊</h3>
            <p>
              <strong>申請編號：</strong> {displaySurgery.applicationId || '未指定'}
            </p>
            <p>
              <strong>病歷號碼：</strong> {displaySurgery.medicalRecordNumber || '未指定'}
            </p>
            <p>
              <strong>病患姓名：</strong> {displaySurgery.patientName || '未指定'}
            </p>
            <p>
              <strong>手術日期：</strong> {formatDate(displaySurgery.date)}
            </p>
          </div>

          <div className="info-group green">
            <h3>手術資訊</h3>
            <p>
              <strong>科別：</strong> {displaySurgery.departmentName || '未指定'}
            </p>
            <p>
              <strong>手術名稱：</strong> {displaySurgery.surgeryName || '未指定'}
            </p>
            <p>
              <strong>主刀醫師：</strong> {displaySurgery.chiefSurgeonName || displaySurgery.doctor || '未指定'}
            </p>
            <p>
              <strong>手術室：</strong> {getOperatingRoomName()}
            </p>
            <p>
              <strong>預估時間：</strong> {displaySurgery.estimatedSurgeryTime || displaySurgery.duration || '未指定'} {(displaySurgery.estimatedSurgeryTime || displaySurgery.duration) ? '分鐘' : ''}
            </p>
            {displaySurgery.startTime && (
              <p>
                <strong>開始時間：</strong> {formatTime(displaySurgery.startTime)}
              </p>
            )}
            {displaySurgery.endTime && (
              <p>
                <strong>結束時間：</strong> {formatTime(displaySurgery.endTime)}
              </p>
            )}
            <p>
              <strong>麻醉方式：</strong> {displaySurgery.anesthesiaMethod || '未指定'}
            </p>
            <p>
              <strong>手術原因：</strong> {displaySurgery.surgeryReason || '未指定'}
            </p>
          </div>
          <div className="info-group pink">
            <h3>其他資訊</h3>
            <p>
              <strong>特殊需求：</strong>{" "}
              {displaySurgery.specialOrRequirements || "無"}
            </p>
            <p>
              <strong>申請人：</strong> {displaySurgery.user?.name || "未指定"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SurgeryModal;
