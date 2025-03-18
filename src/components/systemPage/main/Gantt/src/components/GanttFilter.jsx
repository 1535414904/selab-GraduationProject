import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import "../styles.css";

// 從外部引入清潔時間顏色
export const getCleaningColor = () => "blue";

const GanttFilter = ({ originalRows, onFilteredDataChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  // 定義可選的篩選條件（與 Modal 顯示欄位對應）
  const filterOptions = [
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
  const filterRef = useRef(null);

  // 1) 攤平原始資料，過濾掉在原始結構就標記 isCleaningTime 的項目（避免重複）
  const flattenedRows = Array.isArray(originalRows)
    ? originalRows.flatMap((row) => {
        if (row.data && Array.isArray(row.data)) {
          return row.data
            .filter((surgery) => !surgery.isCleaningTime)
            .map((surgery) => ({
              ...surgery,
              operatingRoomName: surgery.operatingRoomName || row.name,
            }));
        }
        return row.isCleaningTime ? [] : row;
      })
    : [];

  // 2) 動態蒐集各欄位可供選擇的值
  const availableSurgeryNames = Array.from(
    new Set(flattenedRows.map((s) => s.surgeryName).filter(Boolean))
  );
  const availableChiefSurgeonNames = Array.from(
    new Set(flattenedRows.map((s) => s.chiefSurgeonName || s.doctor).filter(Boolean))
  );
  const availableOperatingRoomNames = Array.from(
    new Set(flattenedRows.map((s) => s.operatingRoomName).filter(Boolean))
  );
  const availableEstimatedTimes = Array.from(
    new Set(flattenedRows.map((s) => s.estimatedSurgeryTime).filter(Boolean))
  );
  const availableAnesthesiaMethods = Array.from(
    new Set(flattenedRows.map((s) => s.anesthesiaMethod).filter(Boolean))
  );
  const availableSurgeryReasons = Array.from(
    new Set(flattenedRows.map((s) => s.surgeryReason).filter(Boolean))
  );
  const availableSpecialOrRequirements = Array.from(
    new Set(flattenedRows.map((s) => s.specialOrRequirements).filter(Boolean))
  );
  const availableUserNames = Array.from(
    new Set(flattenedRows.map((s) => s.user?.name).filter(Boolean))
  );

  // 3) 每次 originalRows 或 filterValues 改變時，執行篩選（但不移除，只標記）
  useEffect(() => {
    applyFilters();
  }, [filterValues, originalRows]);

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
  const calculateCleaningEndTime = (surgeryEndTime, cleaningDurationMinutes = 45) => {
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
        surgery: surgery.surgeryName || surgery.surgery || "未指定手術",
        doctor: surgery.chiefSurgeonName || surgery.doctor || "未指定醫生",
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

    return result;
  };

  // 5) 篩選邏輯：不刪除手術，而是標記 isFilteredOut
  const applyFilters = () => {
    if (!flattenedRows || flattenedRows.length === 0) {
      onFilteredDataChange([]);
      return;
    }

    // 先對所有手術進行標記
    flattenedRows.forEach((s) => {
      // 如果需要排除清潔時間的篩選，可在此自行處理
      // 但本例保留清潔時間以便後續 groupByRoom 自動加上

      // 預設先認為符合篩選
      let meetsFilter = true;

      // surgeryName
      if (
        filterValues.surgeryName?.length > 0 &&
        !filterValues.surgeryName.includes(s.surgeryName)
      ) {
        meetsFilter = false;
      }

      // chiefSurgeonName
      if (
        filterValues.chiefSurgeonName?.length > 0 &&
        !filterValues.chiefSurgeonName.includes(s.chiefSurgeonName) &&
        !filterValues.chiefSurgeonName.includes(s.doctor)
      ) {
        meetsFilter = false;
      }

      // operatingRoomName
      if (
        filterValues.operatingRoomName?.length > 0 &&
        !filterValues.operatingRoomName.includes(s.operatingRoomName)
      ) {
        meetsFilter = false;
      }

      // estimatedSurgeryTime
      if (
        filterValues.estimatedSurgeryTime?.length > 0 &&
        !filterValues.estimatedSurgeryTime.includes(s.estimatedSurgeryTime)
      ) {
        meetsFilter = false;
      }

      // anesthesiaMethod
      if (
        filterValues.anesthesiaMethod?.length > 0 &&
        !filterValues.anesthesiaMethod.includes(s.anesthesiaMethod)
      ) {
        meetsFilter = false;
      }

      // surgeryReason
      if (
        filterValues.surgeryReason?.length > 0 &&
        !filterValues.surgeryReason.includes(s.surgeryReason)
      ) {
        meetsFilter = false;
      }

      // specialOrRequirements
      if (
        filterValues.specialOrRequirements?.length > 0 &&
        !filterValues.specialOrRequirements.includes(s.specialOrRequirements)
      ) {
        meetsFilter = false;
      }

      // userName
      if (
        filterValues.userName?.length > 0 &&
        !filterValues.userName.includes(s.user?.name)
      ) {
        meetsFilter = false;
      }

      // 如果不符合篩選，標記為 isFilteredOut
      s.isFilteredOut = !meetsFilter;
    });

    // 將所有手術(含標記)依房間分組並回傳
    const groupedData = groupByRoom(flattenedRows);
    onFilteredDataChange(groupedData);
  };

  // 6) 新增篩選條件
  const handleAddFilter = (selected) => {
    if (selected && !selectedFilters.find((f) => f.value === selected.value)) {
      setSelectedFilters([...selectedFilters, selected]);
      setFilterValues({ ...filterValues, [selected.value]: [] });
    }
  };

  // 7) 多選下拉改變時更新 filterValues
  const handleFilterChange = (filterKey, selectedOptions) => {
    setFilterValues({
      ...filterValues,
      [filterKey]: selectedOptions ? selectedOptions.map((opt) => opt.value) : [],
    });
  };

  // 8) 移除某個篩選條件
  const handleRemoveFilter = (filterKey) => {
    setSelectedFilters(selectedFilters.filter((f) => f.value !== filterKey));
    const updatedValues = { ...filterValues };
    delete updatedValues[filterKey];
    setFilterValues(updatedValues);
  };

  // 9) 清除所有篩選條件
  const handleClearAllFilters = () => {
    setSelectedFilters([]);
    setFilterValues({});
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
            {/* 新增篩選下拉 */}
            <Select
              options={filterOptions}
              onChange={handleAddFilter}
              placeholder="新增篩選條件..."
            />

            {/* 已選篩選項 */}
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

                {/* 依不同欄位顯示不同的多選下拉 */}
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

                {filter.value === "estimatedSurgeryTime" && (
                  <Select
                    isMulti
                    options={availableEstimatedTimes.map((v) => ({
                      value: v,
                      label: String(v),
                    }))}
                    onChange={(selected) =>
                      handleFilterChange("estimatedSurgeryTime", selected)
                    }
                    placeholder="選擇預估時間..."
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
            {/* 新增清除所有篩選條件的按鈕 */}
            {selectedFilters.length > 0 && (
              <button 
                onClick={handleClearAllFilters} 
                className="clear-filters-btn"
                style={{
                  backgroundColor: "#3498db", // 藍色背景
                  color: "white",            // 白色文字
                  padding: "8px 16px",       // 內間距
                  border: "none",            // 無邊框
                  borderRadius: "4px",       // 邊角圓弧
                  cursor: "pointer",         // 滑鼠指標變成手指
                  marginTop: "12px",         // 頂部間距
                  fontWeight: "500",         // 稍微加粗文字
                  width: "100%"              // 占滿寬度
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
