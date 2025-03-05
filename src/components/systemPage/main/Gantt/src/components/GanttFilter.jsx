import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";

const GanttFilter = ({ originalRows, onFilteredDataChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const filterOptions = [
    { value: "department", label: "科別" },
    { value: "roomType", label: "手術房類型" },
    { value: "roomName", label: "手術房名稱" },
    { value: "overtime", label: "超時手術" },
  ];
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [filterValues, setFilterValues] = useState({});
  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [availableRoomTypes, setAvailableRoomTypes] = useState([]);
  const [availableRoomNames, setAvailableRoomNames] = useState([]);
  const filterRef = useRef(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const resDepartments = await fetch("/api/departments");
        const resRoomTypes = await fetch("/api/roomTypes");
        const resRoomNames = await fetch("/api/roomNames");

        setAvailableDepartments(await resDepartments.json());
        setAvailableRoomTypes(await resRoomTypes.json());
        setAvailableRoomNames(await resRoomNames.json());
      } catch (error) {
        console.error("載入篩選條件失敗", error);
      }
    }
    fetchData();
  }, []);

  // 當篩選條件變更時，應用篩選並通知父組件
  useEffect(() => {
    applyFilters();
  }, [filterValues, originalRows]);

  // 點擊篩選器外部時，自動關閉
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

  // 應用篩選邏輯
  const applyFilters = () => {
    if (!originalRows || originalRows.length === 0) {
      onFilteredDataChange([]);
      return;
    }

    const filteredData = originalRows.filter((room) => {
      // 基本篩選條件
      if (filterValues.department?.length > 0 && !filterValues.department.includes(room.department)) return false;
      if (filterValues.roomType?.length > 0 && !filterValues.roomType.includes(room.roomType)) return false;
      if (filterValues.roomName?.length > 0 && !filterValues.roomName.includes(room.room)) return false;
      if (filterValues.overtime && !room.hasOvertime) return false;
      
      return true;
    });

    onFilteredDataChange(filteredData);
  };

  const handleAddFilter = (selected) => {
    if (selected && !selectedFilters.find((f) => f.value === selected.value)) {
      setSelectedFilters([...selectedFilters, selected]);
      setFilterValues({ ...filterValues, [selected.value]: [] });
    }
  };

  const handleFilterChange = (filterKey, selectedOptions) => {
    setFilterValues({
      ...filterValues,
      [filterKey]: selectedOptions ? selectedOptions.map((opt) => opt.value) : [],
    });
  };

  const handleRemoveFilter = (filterKey) => {
    setSelectedFilters(selectedFilters.filter((f) => f.value !== filterKey));
    const updatedValues = { ...filterValues };
    delete updatedValues[filterKey];
    setFilterValues(updatedValues);
  };

  return (
    <>
      {/* 整個篩選器 + 按鈕區域，讓它們同步移動 */}
      <div
        ref={filterRef}
        className={`filter-panel-container ${isOpen ? "filter-panel-open" : "filter-panel-closed"}`}
      >
        {/* 篩選面板 */}
        <div className="filter-panel">
          {/* 標題 */}
          <div className="filter-header">
            <h3 className="filter-title">篩選條件</h3>
            <button onClick={() => setIsOpen(false)} className="filter-close-btn">✕</button>
          </div>

          <div className="filter-content">
            {/* 新增篩選條件 */}
            <Select options={filterOptions} onChange={handleAddFilter} placeholder="新增篩選條件..." />

            {/* 已選擇的篩選條件 */}
            {selectedFilters.map((filter) => (
              <div key={filter.value} className="filter-item">
                <div className="filter-item-header">
                  <span className="filter-item-title">{filter.label}</span>
                  <button onClick={() => handleRemoveFilter(filter.value)} className="filter-remove-btn">✕</button>
                </div>

                {filter.value === "department" && (
                  <Select
                    isMulti
                    options={availableDepartments.map((d) => ({ value: d, label: d }))}
                    onChange={(selected) => handleFilterChange("department", selected)}
                    placeholder="選擇科別..."
                  />
                )}

                {filter.value === "roomType" && (
                  <Select
                    isMulti
                    options={availableRoomTypes.map((r) => ({ value: r, label: r }))}
                    onChange={(selected) => handleFilterChange("roomType", selected)}
                    placeholder="選擇手術房類型..."
                  />
                )}

                {filter.value === "roomName" && (
                  <Select
                    isMulti
                    options={availableRoomNames.map((r) => ({ value: r, label: r }))}
                    onChange={(selected) => handleFilterChange("roomName", selected)}
                    placeholder="選擇手術房名稱..."
                  />
                )}

                {filter.value === "overtime" && (
                  <div className="filter-checkbox-container">
                    <input
                      type="checkbox"
                      checked={filterValues.overtime || false}
                      onChange={(e) => setFilterValues({ ...filterValues, overtime: e.target.checked })}
                    />
                    <label className="filter-checkbox-label">僅顯示超時手術</label>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 「篩選」按鈕，與篩選面板一起移動 */}
        <button
          className="filter-toggle-btn"
          onClick={() => setIsOpen(!isOpen)}
        >
          篩選
        </button>
      </div>
    </>
  );
};

export default GanttFilter;
