import React, { useEffect } from "react";
import "./SurgeryModal.css";

function SurgeryModal({ surgery, onClose, error }) {
  if (!surgery) return null;

  // 添加按ESC鍵關閉模態視窗的功能
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    // 防止背景滾動
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscKey);

    return () => {
      // 恢復背景滾動
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleEscKey);
    };
  }, [onClose]);

  // 格式化日期顯示
  const formatDate = (dateValue) => {
    if (!dateValue) return '未指定';
    
    try {
      if (typeof dateValue === 'string') {
        // 如果是字符串，直接返回
        return dateValue;
      } else {
        // 如果是日期對象，格式化為本地日期字符串
        return new Date(dateValue).toLocaleDateString();
      }
    } catch (error) {
      console.error('日期格式化錯誤:', error);
      return '日期格式錯誤';
    }
  };

  // 確保手術室名稱正確顯示
  const getOperatingRoomName = () => {
    // 優先使用最新的手術室名稱
    return surgery.operatingRoomName || '未指定';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>手術詳細資訊</h2>
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

        {surgery.isPinned && (
          <div className="info-banner bg-red-50 border-l-4 border-red-500 p-3 mx-4 mt-4">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-600 mr-2">
                <path d="M16 9V4h1c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z" />
              </svg>
              <p className="text-sm text-red-700">此手術房已被釘選，手術排程無法移動</p>
            </div>
          </div>
        )}

        <div className="modal-body">
          <div className="info-group">
            <h3>基本資訊</h3>
            <p>
              <strong>申請編號：</strong> {surgery.applicationId || '未指定'}
            </p>
            <p>
              <strong>病歷號碼：</strong> {surgery.medicalRecordNumber || '未指定'}
            </p>
            <p>
              <strong>病患姓名：</strong> {surgery.patientName || '未指定'}
            </p>
            <p>
              <strong>手術日期：</strong> {formatDate(surgery.date)}
            </p>
          </div>

          <div className="info-group green">
            <h3>手術資訊</h3>
            <p>
              <strong>手術名稱：</strong> {surgery.surgeryName || '未指定'}
            </p>
            <p>
              <strong>主刀醫師：</strong> {surgery.chiefSurgeonName || surgery.doctor || '未指定'}
            </p>
            <p>
              <strong>手術房：</strong> {getOperatingRoomName()}
            </p>
            <p>
              <strong>預估時間：</strong> {surgery.estimatedSurgeryTime || surgery.duration || '未指定'} {(surgery.estimatedSurgeryTime || surgery.duration) ? '分鐘' : ''}
            </p>
            {/* 只有在甘特圖項目中才會有開始和結束時間 */}
            {surgery.startTime && (
              <p>
                <strong>開始時間：</strong> {surgery.startTime}
              </p>
            )}
            {surgery.endTime && (
              <p>
                <strong>結束時間：</strong> {surgery.endTime}
              </p>
            )}
            <p>
              <strong>麻醉方式：</strong> {surgery.anesthesiaMethod || '未指定'}
            </p>
            <p>
              <strong>手術原因：</strong> {surgery.surgeryReason || '未指定'}
            </p>
          </div>

          <div className="info-group pink">
            <h3>其他資訊</h3>
            <p>
              <strong>特殊需求：</strong>{" "}
              {surgery.specialOrRequirements || "無"}
            </p>
            <p>
              <strong>申請人：</strong> {surgery.user?.name || "未指定"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SurgeryModal;
