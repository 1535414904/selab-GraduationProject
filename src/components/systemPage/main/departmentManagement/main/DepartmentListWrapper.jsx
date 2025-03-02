/* eslint-disable react/prop-types */
import { BASE_URL } from "../../../../../config";
import { faPenSquare, faPerson } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import EditableRow from "./EditableRow";
import axios from "axios";

function DepartmentListWrapper({
  departments,
  setDepartments,
  filterDepartment,
  deleteMode,
  selectedDepartments,
  setSelectedDepartments,
  setIdforChiefSurgeons,
}) {
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const tbodyRef = useRef(null);
  const theadRef = useRef(null);

  useEffect(() => {
    if (!departments.length) return;

    const newFilteredDepartments = departments.filter((department) => {
      const matchesId = filterDepartment.id
        ? department.id
            .toLowerCase()
            .includes(filterDepartment.id.toLowerCase())
        : true;
      const matchesName = filterDepartment.name
        ? department.name
            .toLowerCase()
            .includes(filterDepartment.name.toLowerCase())
        : true;

      return matchesId && matchesName;
    });

    const sortedDepartments = newFilteredDepartments.sort(
      (a, b) => b.role - a.role
    );

    setFilteredDepartments(sortedDepartments);
  }, [departments, filterDepartment.id, filterDepartment.name]);

  useEffect(() => {
    const adjustTheadWidth = () => {
      if (tbodyRef.current.scrollHeight > window.innerHeight * 0.6) {
        theadRef.current.style.width = "calc(100% - 17px)";
      } else {
        theadRef.current.style.width = "100%";
      }
    };

    if (tbodyRef.current) {
      adjustTheadWidth();
      tbodyRef.current.addEventListener("scroll", adjustTheadWidth);
    }

    return () => {
      if (tbodyRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        tbodyRef.current.removeEventListener("scroll", adjustTheadWidth);
      }
    };
  }, [filteredDepartments]);

  const handleEdit = (department) => {
    setEditingDepartment(department);
  };

  const handleSave = async (updatedDeparment) => {
    try {
      await axios.put(
        `${BASE_URL}/api/system/department/${updatedDeparment.id}`,
        updatedDeparment
      );
      const response = await axios.get(`${BASE_URL}/api/system/departments`);
      setDepartments(response.data);
      setEditingDepartment(null);
    } catch (error) {
      console.error("updated error：", error);
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedDepartments((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((department) => department !== id)
        : [...prevSelected, id]
    );
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-6 overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead ref={theadRef} className="bg-gray-50">
          <tr>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
              科別編號
            </th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
              科別名稱
            </th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
              醫師人數
            </th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
              動作
            </th>
          </tr>
        </thead>
        <tbody ref={tbodyRef} className="divide-y divide-gray-200">
          {filteredDepartments.length > 0 ? (
            filteredDepartments.map((department) => (
              <tr
                key={department.id}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                {editingDepartment?.id === department.id ? (
                  <EditableRow
                    department={department}
                    handleSave={handleSave}
                  />
                ) : (
                  <>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      {department.id}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      {department.name}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      {department.chiefSurgeonsCount}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {deleteMode ? (
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                          checked={selectedDepartments.includes(department.id)}
                          onChange={() => handleCheckboxChange(department.id)}
                        />
                      ) : (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(department)}
                            className="text-blue-600 hover:text-blue-800 transition-colors duration-150"
                            title="編輯科別"
                          >
                            <FontAwesomeIcon icon={faPenSquare} size="lg" />
                          </button>
                          <button
                            onClick={() => setIdforChiefSurgeons(department.id)}
                            className="text-green-600 hover:text-green-800 transition-colors duration-150"
                            title="查看醫師"
                          >
                            <FontAwesomeIcon icon={faPerson} size="lg" />
                          </button>
                        </div>
                      )}
                    </td>
                  </>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="4"
                className="py-4 px-4 text-center text-gray-500 italic"
              >
                無符合條件的資料
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DepartmentListWrapper;
