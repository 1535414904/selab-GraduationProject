import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import "../styles.css";

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
    // userName 表示要篩選 surgery.user?.name
  ];

  const [selectedFilters, setSelectedFilters] = useState([]);
  const [filterValues, setFilterValues] = useState({});
  const filterRef = useRef(null);

  // 1) 先將原始手術資料攤平（若原始資料就是平的，就可省略）
  //   如果 originalRows 已經是單純的陣列，每筆就是一個手術，則可直接使用 originalRows
  //   如果是「以房間分組」的資料結構，則要用 flatMap 攤平
  const flattenedRows = Array.isArray(originalRows)
    ? originalRows.flatMap((row) => {
        // 檢查是否有 data 屬性（表示是房間）
        if (row.data && Array.isArray(row.data)) {
          // 將房間內的手術資料攤平，並為每個手術加上 operatingRoomName
          return row.data.map(surgery => ({
            ...surgery,
            operatingRoomName: surgery.operatingRoomName || row.name // 如果手術沒有房間名稱，使用 row.name
          }));
        }
        // 如果已經是單個手術，直接返回
        return row;
      })
    : [];

  // 2) 從 flattenedRows 裡動態蒐集各欄位可供選擇的值
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

  // 3) 每次 originalRows 或 filterValues 改變時，執行篩選
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

  // 依手術室分組
  const groupByRoom = (surgeries) => {
    const roomGroups = {};
    const result = [];
    
    // 先確保每個手術都有 operatingRoomName
    surgeries.forEach(surgery => {
      const roomName = surgery.operatingRoomName || '未指定手術室';
      
      // 如果這個手術室尚未建立，則新增一個群組
      if (!roomGroups[roomName]) {
        const newRoom = {
          id: `room-${roomName}`,
          name: roomName,
          data: []
        };
        roomGroups[roomName] = newRoom;
        result.push(newRoom);
      }
      
      // 將手術資料加入該手術室的 data 陣列
      // 確保每個手術有必要的屬性供 RoomItem 使用
      const surgeryData = {
        ...surgery,
        surgery: surgery.surgeryName || surgery.surgery || '未指定手術',
        doctor: surgery.chiefSurgeonName || surgery.doctor || '未指定醫生',
        color: surgery.color || 'green',
        startTime: surgery.startTime || '08:00',
        endTime: surgery.endTime || '09:00',
        // 確保有 applicationId 以便點擊時顯示 modal
        applicationId: surgery.applicationId || `temp-${Math.random().toString(36).substr(2, 9)}`
      };
      
      roomGroups[roomName].data.push(surgeryData);
    });
    
    return result;
  };

  // 5) 篩選邏輯：根據 filterValues 過濾 flattenedRows
  const applyFilters = () => {
    if (!flattenedRows || flattenedRows.length === 0) {
      onFilteredDataChange([]);
      return;
    }
    
    const filteredData = flattenedRows.filter((s) => {
      // surgeryName
      if (
        filterValues.surgeryName?.length > 0 &&
        !filterValues.surgeryName.includes(s.surgeryName)
      ) {
        return false;
      }
      
      // chiefSurgeonName (使用 doctor 欄位作為替代)
      if (
        filterValues.chiefSurgeonName?.length > 0 &&
        !filterValues.chiefSurgeonName.includes(s.chiefSurgeonName) &&
        !filterValues.chiefSurgeonName.includes(s.doctor)
      ) {
        return false;
      }
      
      // operatingRoomName
      if (
        filterValues.operatingRoomName?.length > 0 &&
        !filterValues.operatingRoomName.includes(s.operatingRoomName)
      ) {
        return false;
      }
      
      // estimatedSurgeryTime
      if (
        filterValues.estimatedSurgeryTime?.length > 0 &&
        !filterValues.estimatedSurgeryTime.includes(s.estimatedSurgeryTime)
      ) {
        return false;
      }
      
      // anesthesiaMethod
      if (
        filterValues.anesthesiaMethod?.length > 0 &&
        !filterValues.anesthesiaMethod.includes(s.anesthesiaMethod)
      ) {
        return false;
      }
      
      // surgeryReason
      if (
        filterValues.surgeryReason?.length > 0 &&
        !filterValues.surgeryReason.includes(s.surgeryReason)
      ) {
        return false;
      }
      
      // specialOrRequirements
      if (
        filterValues.specialOrRequirements?.length > 0 &&
        !filterValues.specialOrRequirements.includes(s.specialOrRequirements)
      ) {
        return false;
      }
      
      // userName
      if (
        filterValues.userName?.length > 0 &&
        !filterValues.userName.includes(s.user?.name)
      ) {
        return false;
      }

      return true;
    });

    // 將過濾後的資料依房間分組
    const groupedData = groupByRoom(filteredData);
    
    // 將分組後的資料傳回給父組件
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

  return (
    <>
      <div
        ref={filterRef}
        className={`filter-panel-container ${isOpen ? "filter-panel-open" : "filter-panel-closed"}`}
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
                    options={availableSurgeryNames.map((v) => ({ value: v, label: v }))}
                    onChange={(selected) => handleFilterChange("surgeryName", selected)}
                    placeholder="選擇手術名稱..."
                  />
                )}

                {filter.value === "chiefSurgeonName" && (
                  <Select
                    isMulti
                    options={availableChiefSurgeonNames.map((v) => ({ value: v, label: v }))}
                    onChange={(selected) => handleFilterChange("chiefSurgeonName", selected)}
                    placeholder="選擇主刀醫師..."
                  />
                )}

                {filter.value === "operatingRoomName" && (
                  <Select
                    isMulti
                    options={availableOperatingRoomNames.map((v) => ({ value: v, label: v }))}
                    onChange={(selected) => handleFilterChange("operatingRoomName", selected)}
                    placeholder="選擇手術室..."
                  />
                )}

                {filter.value === "estimatedSurgeryTime" && (
                  <Select
                    isMulti
                    options={availableEstimatedTimes.map((v) => ({ value: v, label: String(v) }))}
                    onChange={(selected) => handleFilterChange("estimatedSurgeryTime", selected)}
                    placeholder="選擇預估時間..."
                  />
                )}

                {filter.value === "anesthesiaMethod" && (
                  <Select
                    isMulti
                    options={availableAnesthesiaMethods.map((v) => ({ value: v, label: v }))}
                    onChange={(selected) => handleFilterChange("anesthesiaMethod", selected)}
                    placeholder="選擇麻醉方式..."
                  />
                )}

                {filter.value === "surgeryReason" && (
                  <Select
                    isMulti
                    options={availableSurgeryReasons.map((v) => ({ value: v, label: v }))}
                    onChange={(selected) => handleFilterChange("surgeryReason", selected)}
                    placeholder="選擇手術原因..."
                  />
                )}

                {filter.value === "specialOrRequirements" && (
                  <Select
                    isMulti
                    options={availableSpecialOrRequirements.map((v) => ({ value: v, label: v }))}
                    onChange={(selected) => handleFilterChange("specialOrRequirements", selected)}
                    placeholder="選擇特殊需求..."
                  />
                )}

                {filter.value === "userName" && (
                  <Select
                    isMulti
                    options={availableUserNames.map((v) => ({ value: v, label: v }))}
                    onChange={(selected) => handleFilterChange("userName", selected)}
                    placeholder="選擇申請人..."
                  />
                )}
              </div>
            ))}
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