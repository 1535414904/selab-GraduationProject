/* eslint-disable react/prop-types */
function DepartmentAddWrapper({ departments, setDepartments, emptyError }) {
  const handleChange = (index, event) => {
    const { name, value } = event.target;
    const updatedDepartments = [...departments];
    updatedDepartments[index][name] = value;
    setDepartments(updatedDepartments);
  };

  const addRow = () => {
    setDepartments([...departments, { id: "", name: "" }]);
  };

  const removeRow = () => {
    // 修正了typo: legth -> length
    if (departments.length > 1) {
      setDepartments(departments.slice(0, -1));
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800">科別管理</h2>
        <p className="text-sm text-gray-500">新增或修改科別資訊</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
                科別編號
              </th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b">
                科別名稱
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {departments.map((department, index) => (
              <tr
                key={index}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="py-2 px-6 border-b border-gray-200">
                  <input
                    type="text"
                    name="id"
                    value={department.id}
                    onChange={(e) => handleChange(index, e)}
                    placeholder="輸入科別編號"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
                <td className="py-2 px-6 border-b border-gray-200">
                  <input
                    type="text"
                    name="name"
                    value={department.name}
                    onChange={(e) => handleChange(index, e)}
                    placeholder="輸入科別名稱"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {emptyError && <p className="mt-2 text-sm text-red-600">{emptyError}</p>}

      <div className="mt-4 flex space-x-2">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300 flex items-center shadow-sm"
          onClick={addRow}
        >
          <svg
            className="w-4 h-4 mr-1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          新增列
        </button>
        <button
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-300 flex items-center shadow-sm"
          onClick={removeRow}
          disabled={departments.length <= 1}
        >
          <svg
            className="w-4 h-4 mr-1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
          移除列
        </button>
      </div>
    </div>
  );
}

export default DepartmentAddWrapper;
