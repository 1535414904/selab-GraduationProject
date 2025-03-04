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

          <div className="info-group">
            <h3>手術資訊</h3>
            <p>
              <strong>手術名稱：</strong> {surgery.surgeryName || '未指定'}
            </p>
            <p>
              <strong>主刀醫師：</strong> {surgery.chiefSurgeonName || '未指定'}
            </p>
            <p>
              <strong>手術室：</strong> {surgery.operatingRoomName || '未指定'}
            </p>
            <p>
              <strong>預估時間：</strong> {surgery.estimatedSurgeryTime || '未指定'} {surgery.estimatedSurgeryTime ? '分鐘' : ''}
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

          <div className="info-group">
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
