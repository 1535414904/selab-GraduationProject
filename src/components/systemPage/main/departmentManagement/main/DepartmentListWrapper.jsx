/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { BASE_URL } from "../../../../../config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenSquare, faPlus, faTrash, faUsers } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import EditableRow from "./EditableRow";
import AddRow from "./AddRow";
import ChiefSurgeonListWrapper from "../chiefSurgeonManagement/ChiefSurgeonListWrapper";
import "../../Mgr.css";

function DepartmentListWrapper({
  departments,
  setDepartments,
  filterDepartment,
  selectedDepartments,
  setSelectedDepartments,
  handleDelete,
  addDepartments,
  setAddDepartments,
  handleAdd,
  emptyError,
}) {
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [addChiefSurgeons, setAddChiefSurgeons] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!departments.length) return;

    const newFilteredDepartments = departments.filter((department) => {
      const matchesId = filterDepartment.id
        ? department.id.toLowerCase().includes(filterDepartment.id.toLowerCase())
        : true;
      const matchesName = filterDepartment.name
        ? department.name.toLowerCase().includes(filterDepartment.name.toLowerCase())
        : true;
      return matchesId && matchesName;
    });

    setFilteredDepartments(newFilteredDepartments.sort((a, b) => b.role - a.role));
  }, [departments, filterDepartment.id, filterDepartment.name]);

  const toggleRow = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  const handleEdit = (department) => {
    setEditingDepartment(department);
  };

  const handleSave = async (updatedDepartment) => {
    try {
      await axios.put(`${BASE_URL}/api/system/department/${updatedDepartment.id}`, updatedDepartment);
      const response = await axios.get(`${BASE_URL}/api/system/departments`);
      setDepartments(response.data);
      setEditingDepartment(null);
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedDepartments((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((department) => department !== id)
        : [...prevSelected, id]
    );
  };

  const addRow = () => {
    setAddChiefSurgeons([...addChiefSurgeons, { id: "", name: "" }]);
  };

  // 
  // 舊的 return 我怕做壞，所以先保留，壞了再改回來。
  // return (
  //   <div className="mgr-list">
  //     <table className="system-table">
  //       <thead>
  //         <tr>
  //           <th>選取</th>
  //           <th>科別編號</th>
  //           <th>科別名稱</th>
  //           <th>醫師人數</th>
  //           <th>動作</th>
  //         </tr>
  //       </thead>
  //       <tbody>
  //         <AddRow
  //           addDepartments={addDepartments}
  //           setAddDepartments={setAddDepartments}
  //           handleAdd={handleAdd}
  //           emptyError={emptyError}
  //         />
  //         {filteredDepartments.length > 0 ? (
  //           filteredDepartments.map((department, index) =>
  //             editingDepartment?.id === department.id ? (
  //               <EditableRow
  //                 key={department.id}
  //                 department={department}
  //                 handleSave={handleSave}
  //                 setIsEditing={setEditingDepartment}
  //               />
  //             ) : (
  //               <>
  //                 <tr
  //                   key={department.id}
  //                   className={
  //                     selectedDepartments.includes(department.id)
  //                       ? "selected"
  //                       : "unselected"
  //                   }
  //                 >
  //                   <td
  //                     onClick={() => handleCheckboxChange(department.id)}
  //                     className={`selectable-cell ${
  //                       selectedDepartments.includes(department.id)
  //                         ? "selected"
  //                         : ""
  //                     }`}
  //                   >
  //                     <input
  //                       type="checkbox"
  //                       checked={selectedDepartments.includes(department.id)}
  //                       onClick={(e) => e.stopPropagation()}
  //                       onChange={() => handleCheckboxChange(department.id)}
  //                       className="checkbox"
  //                     />
  //                   </td>
  //                   <td>{department.id}</td>
  //                   <td>{department.name}</td>
  //                   <td>{department.chiefSurgeonsCount}</td>
  //                   <td>
  //                     <div className="action-buttons">
  //                       <button
  //                         onClick={() => handleEdit(department)}
  //                         className="action-button edit-button"
  //                       >
  //                         <FontAwesomeIcon
  //                           icon={faPenSquare}
  //                           className="action-icon"
  //                         />
  //                       </button>
  //                       <button
  //                         onClick={() =>
  //                           handleDelete(department.id, department.name)
  //                         }
  //                         className="action-button delete-button"
  //                       >
  //                         <FontAwesomeIcon
  //                           icon={faTrash}
  //                           className="action-icon"
  //                         />
  //                       </button>
  //                       <button
  //                         onClick={() => {
  //                           toggleRow(index);
  //                           setAddChiefSurgeons([]);
  //                         }}
  //                         className="action-button view-button"
  //                       >
  //                         <FontAwesomeIcon
  //                           icon={faUsers}
  //                           className="action-icon"
  //                         />
  //                       </button>
  //                       {expandedRow === index && (
  //                         <button
  //                           onClick={addRow}
  //                           className="action-button add-button"
  //                         >
  //                           <FontAwesomeIcon
  //                             icon={faPlus}
  //                             className="action-icon"
  //                           />
  //                         </button>
  //                       )}
  //                     </div>
  //                   </td>
  //                 </tr>
  //                 {expandedRow === index && (
  //                   <ChiefSurgeonListWrapper
  //                     departmentId={department.id}
  //                     addChiefSurgeons={addChiefSurgeons}
  //                     setAddChiefSurgeons={setAddChiefSurgeons}
  //                     setDepartments={setDepartments}
  //                     setIsEditing={setIsEditing}
  //                   />
  //                 )}
  //               </>
  //             )
  //           )
  //         ) : (
  //           <tr>
  //             <td colSpan="5" className="py-4 px-4 text-center text-gray-500 italic">
  //               無符合條件的資料
  //             </td>
  //           </tr>
  //         )}
  //       </tbody>
  //     </table>
  //   </div>
  // );
  return (
    <div className={`flex w-full transition-all duration-300 ${expandedRow !== null ? "flex-col md:flex-row" : "flex-col"}`}>
      {/* 左欄：科別表格 */}
      <div className={`${expandedRow !== null ? "w-full md:w-3/4 pr-2" : "w-full"}`}>
        <div className="mgr-list">
          <table className="system-table">
            <thead>
              <tr>
                <th>選取</th>
                <th>科別編號</th>
                <th>科別名稱</th>
                <th>醫師人數</th>
                <th>動作</th>
              </tr>
            </thead>
            <tbody>
              <AddRow
                addDepartments={addDepartments}
                setAddDepartments={setAddDepartments}
                handleAdd={handleAdd}
                emptyError={emptyError}
              />
              {filteredDepartments.length > 0 ? (
                filteredDepartments.map((department, index) =>
                  editingDepartment?.id === department.id ? (
                    <EditableRow
                      key={department.id}
                      department={department}
                      handleSave={handleSave}
                      setIsEditing={setEditingDepartment}
                    />
                  ) : (
                    <tr
                      key={department.id}
                      className={
                        selectedDepartments.includes(department.id)
                          ? "selected"
                          : "unselected"
                      }
                    >
                      <td
                        onClick={() => handleCheckboxChange(department.id)}
                        className={`selectable-cell ${selectedDepartments.includes(department.id)
                          ? "selected"
                          : ""
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedDepartments.includes(department.id)}
                          onClick={(e) => e.stopPropagation()}
                          onChange={() => handleCheckboxChange(department.id)}
                          className="checkbox"
                        />
                      </td>
                      <td>{department.id}</td>
                      <td>{department.name}</td>
                      <td>{department.chiefSurgeonsCount}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleEdit(department)}
                            className="action-button edit-button"
                          >
                            <FontAwesomeIcon
                              icon={faPenSquare}
                              className="action-icon"
                            />
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(department.id, department.name)
                            }
                            className="action-button delete-button"
                          >
                            <FontAwesomeIcon
                              icon={faTrash}
                              className="action-icon"
                            />
                          </button>
                          <button
                            onClick={() => {
                              toggleRow(index);
                              setAddChiefSurgeons([]);
                            }}
                            className="action-button view-button"
                          >
                            <FontAwesomeIcon
                              icon={faUsers}
                              className="action-icon"
                            />
                          </button>
                          {expandedRow === index && (
                            <button
                              onClick={addRow}
                              className="action-button add-button"
                            >
                              <FontAwesomeIcon
                                icon={faPlus}
                                className="action-icon"
                              />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td colSpan="5" className="py-4 px-4 text-center text-gray-500 italic">
                    無符合條件的資料
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 右欄：主治醫師區塊 */}
      {expandedRow !== null && (
        <div className="w-full md:w-1/4 border-l bg-white p-4 animate-slide-in-right">
          <ChiefSurgeonListWrapper
            departmentId={filteredDepartments[expandedRow]?.id}
            addChiefSurgeons={addChiefSurgeons}
            setAddChiefSurgeons={setAddChiefSurgeons}
            setDepartments={setDepartments}
            setIsEditing={setIsEditing}
          />
        </div>
      )}
    </div>
  );

}

export default DepartmentListWrapper;
