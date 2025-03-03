import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";

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

  useEffect(() => {
    onFilterChange(filterValues);
  }, [filterValues]);

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
        className={`fixed top-0 left-0 h-full flex items-center transition-transform duration-300 z-[1050] ${
          isOpen ? "translate-x-0" : "-translate-x-72"
        }`}
      >
        {/* 篩選面板 */}
        <div className="w-72 h-full bg-white shadow-lg relative">
          {/* 標題 */}
          <div className="flex justify-between items-center bg-blue-600 text-white px-4 py-3">
            <h3 className="text-lg font-semibold">篩選條件</h3>
            <button onClick={() => setIsOpen(false)} className="text-xl">✕</button>
          </div>

          <div className="p-4">
            {/* 新增篩選條件 */}
            <Select options={filterOptions} onChange={handleAddFilter} placeholder="新增篩選條件..." />

            {/* 已選擇的篩選條件 */}
            {selectedFilters.map((filter) => (
              <div key={filter.value} className="mt-3 border rounded-md p-3 bg-gray-100">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{filter.label}</span>
                  <button onClick={() => handleRemoveFilter(filter.value)} className="text-red-500 hover:text-red-700">✕</button>
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
                  <div className="mt-2 flex items-center">
                    <input
                      type="checkbox"
                      checked={filterValues.overtime || false}
                      onChange={(e) => setFilterValues({ ...filterValues, overtime: e.target.checked })}
                    />
                    <label className="ml-2">僅顯示超時手術</label>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 「篩選」按鈕，與篩選面板一起移動 */}
        <button
          className="absolute right-[-64px] bg-blue-600 text-white px-4 py-2 rounded-r-md shadow-lg h-14 flex items-center justify-center"
          onClick={() => setIsOpen(!isOpen)}
        >
          篩選
        </button>
      </div>
    </>
  );
};

export default GanttFilter;
