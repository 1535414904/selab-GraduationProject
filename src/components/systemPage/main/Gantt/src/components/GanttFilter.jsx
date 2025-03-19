import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import "../styles.css";

// 從外部引入清潔時間顏色
export const getCleaningColor = () => "blue";

const GanttFilter = ({ originalRows, onFilteredDataChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  // 修改篩選條件順序，將科別移到最前面
  const filterOptions = [
    { value: "specialty", label: "科別" },
    { value: "surgeryName", label: "手術名稱" },
    { value: "chiefSurgeonName", label: "主刀醫師" },
    { value: "operatingRoomName", label: "手術室" },
    { value: "estimatedSurgeryTime", label: "預估時間" },
    { value: "anesthesiaMethod", label: "麻醉方式" },
    { value: "surgeryReason", label: "手術原因" },
    { value: "specialOrRequirements", label: "特殊需求" },
    { value: "userName", label: "申請人" },
  ];

  const [selectedFilters, setSelectedFilters] = useState([]);
  const [filterValues, setFilterValues] = useState({});
  // 新增預估時間範圍的狀態
  const [timeRange, setTimeRange] = useState({ min: "", max: "" });
  const filterRef = useRef(null);

  // 1) 攤平原始資料，過濾掉已標記 isCleaningTime 的項目（避免重複）
  // 修改處：若手術資料中未指定手術室，則嘗試使用 row.name 或 row.room，再無則預設「未指定手術室」
  const flattenedRows = Array.isArray(originalRows)
    ? originalRows.flatMap((row) => {
        if (row.data && Array.isArray(row.data)) {
          return row.data
            .filter((surgery) => !surgery.isCleaningTime)
            .map((surgery) => ({
              ...surgery,
              operatingRoomName:
                surgery.operatingRoomName || row.name || row.room || "未指定手術室",
            }));
        }
        return row.isCleaningTime ? [] : row;
      })
    : [];

  // 2) 動態蒐集各欄位可供選擇的值，並按照字母順序 (A→Z) 排序
  const availableSurgeryNames = Array.from(
    new Set(flattenedRows.map((s) => s.surgeryName).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  const availableChiefSurgeonNames = Array.from(
    new Set(flattenedRows.map((s) => s.chiefSurgeonName || s.doctor).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  const availableOperatingRoomNames = Array.from(
    new Set(flattenedRows.map((s) => s.operatingRoomName).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  // 獲取預估時間的最小值和最大值，用於範圍選擇器
  const estimatedTimes = flattenedRows
    .map((s) => s.estimatedSurgeryTime)
    .filter(Boolean)
    .map(Number);
  
  const minEstimatedTime = estimatedTimes.length > 0 ? Math.min(...estimatedTimes) : 0;
  const maxEstimatedTime = estimatedTimes.length > 0 ? Math.max(...estimatedTimes) : 100;

  const availableAnesthesiaMethods = Array.from(
    new Set(flattenedRows.map((s) => s.anesthesiaMethod).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  const availableSurgeryReasons = Array.from(
    new Set(flattenedRows.map((s) => s.surgeryReason).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  const availableSpecialOrRequirements = Array.from(
    new Set(flattenedRows.map((s) => s.specialOrRequirements).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  const availableUserNames = Array.from(
    new Set(flattenedRows.map((s) => s.user?.name).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  // 新增科別，同樣按照字母順序排
  const availableSpecialties = Array.from(
    new Set(flattenedRows.map((s) => s.specialty).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  // 3) 每次 originalRows、filterValues 或 timeRange 改變時，執行篩選（但不移除，只標記）
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterValues, originalRows, timeRange]);

  // 4) 點擊篩選器外部時關閉抽屜
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // 計算清潔結束時間的輔助函式
  const calculateCleaningEndTime = (
    surgeryEndTime,
    cleaningDurationMinutes = 45
  ) => {
    if (!surgeryEndTime) return "10:00";
    const [hours, minutes] = surgeryEndTime.split(":").map(Number);
    const endTimeDate = new Date();
    endTimeDate.setHours(hours, minutes + cleaningDurationMinutes, 0, 0);
    return `${String(endTimeDate.getHours()).padStart(2, "0")}:${String(
      endTimeDate.getMinutes()
    ).padStart(2, "0")}`;
  };

  // 依手術室分組，並為每個手術添加清潔時間
  const groupByRoom = (surgeries) => {
    const roomGroups = {};
    const result = [];

    // 先排序手術（按房間名稱和開始時間）
    const sortedSurgeries = [...surgeries].sort((a, b) => {
      const roomComparison = (a.operatingRoomName || "").localeCompare(
        b.operatingRoomName || ""
      );
      if (roomComparison !== 0) return roomComparison;
      return (a.startTime || "").localeCompare(b.startTime || "");
    });

    sortedSurgeries.forEach((surgery) => {
      const roomName = surgery.operatingRoomName || "未指定手術室";
      if (!roomGroups[roomName]) {
        const newRoom = {
          id: `room-${roomName}`,
          name: roomName,
          room: roomName, // 保持與 name 一致
          data: [],
        };
        roomGroups[roomName] = newRoom;
        result.push(newRoom);
      }

      // 根據 isFilteredOut 來決定顏色是否要半透明
      const surgeryColor = surgery.isFilteredOut
        ? "rgba(0, 128, 0, 0.5)" // 半透明綠
        : surgery.color || "green";

      // 建立手術資料
      const surgeryData = {
        ...surgery,
        surgery: surgery.surgeryName 
        ? `${surgery.surgeryName} (${surgery.patientName || '未知病患'})`
        : surgery.surgery || "未指定手術",
        doctor: surgery.chiefSurgeonName || surgery.doctor || "未指定醫生",
        patientName: surgery.patientName || "未知病患",
        operatingRoomName: roomName,
        color: surgeryColor,
        startTime: surgery.startTime || "08:00",
        endTime: surgery.endTime || "09:00",
        applicationId:
          surgery.applicationId ||
          `temp-${Math.random().toString(36).substr(2, 9)}`,
      };

      roomGroups[roomName].data.push(surgeryData);

      // 為每個手術添加清潔時間區塊
      const cleaningColor = surgery.isFilteredOut
        ? "rgba(0, 0, 255, 0.3)" // 半透明藍
        : getCleaningColor();

      const cleaningData = {
        id: `cleaning-${surgeryData.applicationId}`,
        doctor: "清潔時間",
        surgery: "整理中",
        duration: 45,
        isCleaningTime: true,
        operatingRoomName: roomName,
        color: cleaningColor,
        startTime: surgeryData.endTime,
        endTime: calculateCleaningEndTime(surgeryData.endTime),
        associatedSurgeryId: surgeryData.applicationId,
        applicationId: `cleaning-${surgeryData.applicationId}`,
      };

      roomGroups[roomName].data.push(cleaningData);
    });

    // 補上原始資料中存在但可能因篩選而無手術資料的手術室
    if (Array.isArray(originalRows)) {
      originalRows.forEach((row) => {
        // 修改處：若 row 中有 room 屬性則以該屬性為主，否則使用 row.name，再無則預設「未指定手術室」
        const roomName = row.room || row.name || "未指定手術室";
        if (!roomGroups[roomName]) {
          const newRoom = {
            id: `room-${roomName}`,
            name: roomName,
            room: roomName,
            data: [],
          };
          roomGroups[roomName] = newRoom;
          result.push(newRoom);
        }
      });
    }
    return result;
  };

  // 5) 篩選邏輯：不刪除手術，而是標記 isFilteredOut
  const applyFilters = () => {
    if (!flattenedRows || flattenedRows.length === 0) {
      onFilteredDataChange([]);
      return;
    }

    // 對所有手術進行標記
    flattenedRows.forEach((s) => {
      let meetsFilter = true;
      if (
        filterValues.surgeryName?.length > 0 &&
        !filterValues.surgeryName.includes(s.surgeryName)
      ) {
        meetsFilter = false;
      }
      if (
        filterValues.chiefSurgeonName?.length > 0 &&
        !filterValues.chiefSurgeonName.includes(s.chiefSurgeonName) &&
        !filterValues.chiefSurgeonName.includes(s.doctor)
      ) {
        meetsFilter = false;
      }
      if (
        filterValues.operatingRoomName?.length > 0 &&
        !filterValues.operatingRoomName.includes(s.operatingRoomName)
      ) {
        meetsFilter = false;
      }
      
      // 使用預估時間範圍進行篩選，而不是多選值
      if (
        (timeRange.min !== "" || timeRange.max !== "") &&
        s.estimatedSurgeryTime !== undefined
      ) {
        const estimatedTime = Number(s.estimatedSurgeryTime);
        if (
          (timeRange.min !== "" && estimatedTime < Number(timeRange.min)) ||
          (timeRange.max !== "" && estimatedTime > Number(timeRange.max))
        ) {
          meetsFilter = false;
        }
      }
      
      if (
        filterValues.anesthesiaMethod?.length > 0 &&
        !filterValues.anesthesiaMethod.includes(s.anesthesiaMethod)
      ) {
        meetsFilter = false;
      }
      if (
        filterValues.surgeryReason?.length > 0 &&
        !filterValues.surgeryReason.includes(s.surgeryReason)
      ) {
        meetsFilter = false;
      }
      if (
        filterValues.specialOrRequirements?.length > 0 &&
        !filterValues.specialOrRequirements.includes(s.specialOrRequirements)
      ) {
        meetsFilter = false;
      }
      if (
        filterValues.userName?.length > 0 &&
        !filterValues.userName.includes(s.user?.name)
      ) {
        meetsFilter = false;
      }
      // 新增科別的篩選
      if (
        filterValues.specialty?.length > 0 &&
        !filterValues.specialty.includes(s.specialty)
      ) {
        meetsFilter = false;
      }

      s.isFilteredOut = !meetsFilter;
    });

    const groupedData = groupByRoom(flattenedRows);
    onFilteredDataChange(groupedData);
  };

  // 6) 新增篩選條件
  const handleAddFilter = (selected) => {
    if (selected && !selectedFilters.find((f) => f.value === selected.value)) {
      setSelectedFilters([...selectedFilters, selected]);
      
      // 如果選擇了預估時間，初始化時間範圍
      if (selected.value === "estimatedSurgeryTime") {
        setTimeRange({ min: String(minEstimatedTime), max: String(maxEstimatedTime) });
      } else {
        setFilterValues({ ...filterValues, [selected.value]: [] });
      }
    }
  };

  // 7) 多選下拉改變時更新 filterValues
  const handleFilterChange = (filterKey, selectedOptions) => {
    setFilterValues({
      ...filterValues,
      [filterKey]: selectedOptions ? selectedOptions.map((opt) => opt.value) : [],
    });
  };

  // 處理時間範圍變更
  const handleTimeRangeChange = (type, value) => {
    setTimeRange(prev => ({
      ...prev,
      [type]: value
    }));
  };

  // 8) 移除某個篩選條件
  const handleRemoveFilter = (filterKey) => {
    setSelectedFilters(selectedFilters.filter((f) => f.value !== filterKey));
    const updatedValues = { ...filterValues };
    delete updatedValues[filterKey];
    setFilterValues(updatedValues);
    
    // 如果移除的是預估時間，重置時間範圍
    if (filterKey === "estimatedSurgeryTime") {
      setTimeRange({ min: "", max: "" });
    }
  };

  // 9) 清除所有篩選條件
  const handleClearAllFilters = () => {
    setSelectedFilters([]);
    setFilterValues({});
    setTimeRange({ min: "", max: "" });
  };

  return (
    <>
      <div
        ref={filterRef}
        className={`filter-panel-container ${
          isOpen ? "filter-panel-open" : "filter-panel-closed"
        }`}
      >
        <div className="filter-panel">
          <div className="filter-header">
            <h3 className="filter-title">篩選條件</h3>
            <button onClick={() => setIsOpen(false)} className="filter-close-btn">
              ✕
            </button>
          </div>
          <div className="filter-content">
            <Select
              options={filterOptions}
              onChange={handleAddFilter}
              placeholder="新增篩選條件..."
            />
            {selectedFilters.map((filter) => (
              <div key={filter.value} className="filter-item">
                <div className="filter-item-header">
                  <span className="filter-item-title">{filter.label}</span>
                  <button
                    onClick={() => handleRemoveFilter(filter.value)}
                    className="filter-remove-btn"
                  >
                    ✕
                  </button>
                </div>
                {/* 使用範圍選擇器替代多選下拉選單 */}
                {filter.value === "estimatedSurgeryTime" && (
                  <div className="range-selector" style={{ marginTop: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                      <label style={{ marginRight: "10px", width: "60px" }}>最小值:</label>
                      <input
                        type="number"
                        value={timeRange.min}
                        onChange={(e) => handleTimeRangeChange("min", e.target.value)}
                        style={{
                          flex: 1,
                          padding: "8px",
                          border: "1px solid #ccc",
                          borderRadius: "4px"
                        }}
                        min={minEstimatedTime}
                        max={maxEstimatedTime}
                      />
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <label style={{ marginRight: "10px", width: "60px" }}>最大值:</label>
                      <input
                        type="number"
                        value={timeRange.max}
                        onChange={(e) => handleTimeRangeChange("max", e.target.value)}
                        style={{
                          flex: 1,
                          padding: "8px",
                          border: "1px solid #ccc",
                          borderRadius: "4px"
                        }}
                        min={minEstimatedTime}
                        max={maxEstimatedTime}
                      />
                    </div>
                    <div style={{ marginTop: "8px" }}>
                      <input
                        type="range"
                        min={minEstimatedTime}
                        max={maxEstimatedTime}
                        value={timeRange.min}
                        onChange={(e) => handleTimeRangeChange("min", e.target.value)}
                        style={{ width: "100%" }}
                      />
                      <input
                        type="range"
                        min={minEstimatedTime}
                        max={maxEstimatedTime}
                        value={timeRange.max}
                        onChange={(e) => handleTimeRangeChange("max", e.target.value)}
                        style={{ width: "100%" }}
                      />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "5px" }}>
                      <span>{minEstimatedTime}</span>
                      <span>{maxEstimatedTime}</span>
                    </div>
                  </div>
                )}
                {filter.value === "specialty" && (
                  <Select
                    isMulti
                    options={availableSpecialties.map((v) => ({
                      value: v,
                      label: v,
                    }))}
                    onChange={(selected) => handleFilterChange("specialty", selected)}
                    placeholder="選擇科別..."
                  />
                )}
                {filter.value === "surgeryName" && (
                  <Select
                    isMulti
                    options={availableSurgeryNames.map((v) => ({
                      value: v,
                      label: v,
                    }))}
                    onChange={(selected) => handleFilterChange("surgeryName", selected)}
                    placeholder="選擇手術名稱..."
                  />
                )}
                {filter.value === "chiefSurgeonName" && (
                  <Select
                    isMulti
                    options={availableChiefSurgeonNames.map((v) => ({
                      value: v,
                      label: v,
                    }))}
                    onChange={(selected) =>
                      handleFilterChange("chiefSurgeonName", selected)
                    }
                    placeholder="選擇主刀醫師..."
                  />
                )}
                {filter.value === "operatingRoomName" && (
                  <Select
                    isMulti
                    options={availableOperatingRoomNames.map((v) => ({
                      value: v,
                      label: v,
                    }))}
                    onChange={(selected) =>
                      handleFilterChange("operatingRoomName", selected)
                    }
                    placeholder="選擇手術室..."
                  />
                )}
                {filter.value === "anesthesiaMethod" && (
                  <Select
                    isMulti
                    options={availableAnesthesiaMethods.map((v) => ({
                      value: v,
                      label: v,
                    }))}
                    onChange={(selected) =>
                      handleFilterChange("anesthesiaMethod", selected)
                    }
                    placeholder="選擇麻醉方式..."
                  />
                )}
                {filter.value === "surgeryReason" && (
                  <Select
                    isMulti
                    options={availableSurgeryReasons.map((v) => ({
                      value: v,
                      label: v,
                    }))}
                    onChange={(selected) =>
                      handleFilterChange("surgeryReason", selected)
                    }
                    placeholder="選擇手術原因..."
                  />
                )}
                {filter.value === "specialOrRequirements" && (
                  <Select
                    isMulti
                    options={availableSpecialOrRequirements.map((v) => ({
                      value: v,
                      label: v,
                    }))}
                    onChange={(selected) =>
                      handleFilterChange("specialOrRequirements", selected)
                    }
                    placeholder="選擇特殊需求..."
                  />
                )}
                {filter.value === "userName" && (
                  <Select
                    isMulti
                    options={availableUserNames.map((v) => ({
                      value: v,
                      label: v,
                    }))}
                    onChange={(selected) => handleFilterChange("userName", selected)}
                    placeholder="選擇申請人..."
                  />
                )}
              </div>
            ))}
            {selectedFilters.length > 0 && (
              <button
                onClick={handleClearAllFilters}
                className="clear-filters-btn"
                style={{
                  backgroundColor: "#3498db",
                  color: "white",
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  marginTop: "12px",
                  fontWeight: "500",
                  width: "100%",
                }}
              >
                清除所有篩選條件
              </button>
            )}
          </div>
        </div>
        <button className="filter-toggle-btn" onClick={() => setIsOpen(!isOpen)}>
          篩選
        </button>
      </div>
    </>
  );
};

export default GanttFilter;