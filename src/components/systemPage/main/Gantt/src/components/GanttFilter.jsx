import React, { useState, useEffect } from "react";
import Select from "react-select";
import "../styles.css"; // ✅ 引入外部 CSS

const GanttFilter = ({ onFilterChange }) => {
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

  useEffect(() => {
    onFilterChange(filterValues);
  }, [filterValues]);

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
      {/* ✅ 側邊篩選按鈕 */}
      <button className="filter-button" onClick={() => setIsOpen(true)}>
        篩選
      </button>

      {/* ✅ 側邊篩選器 */}
      <div className={`filter-sidebar ${isOpen ? "open" : ""}`}>
        {/* ✅ 篩選器標題 */}
        <div className="filter-header">
          <h3>篩選條件</h3>
          <button onClick={() => setIsOpen(false)} className="close-button">✕</button>
        </div>

        <div className="filter-body">
          {/* ✅ 新增篩選條件 */}
          <Select options={filterOptions} onChange={handleAddFilter} placeholder="新增篩選條件..." />

          {/* ✅ 已選擇的篩選條件 */}
          {selectedFilters.map((filter) => (
            <div key={filter.value} className="filter-box">
              <div className="filter-box-header">
                <span>{filter.label}</span>
                <button onClick={() => handleRemoveFilter(filter.value)} className="remove-button">✕</button>
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
                <div className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filterValues.overtime || false}
                    onChange={(e) => setFilterValues({ ...filterValues, overtime: e.target.checked })}
                  />
                  <label>僅顯示超時手術</label>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default GanttFilter;
