import { useEffect, useState, useRef } from "react";
import Select from "react-select";

function AccountFilter({ users, filterUser, setFilterUser }) {
    const [isOpen, setIsOpen] = useState(false);
    const filterRef = useRef(null); // 1️⃣ 定義 useRef 綁定篩選面板

    const handleChange = (e) => {
        setFilterUser(prevState => ({
            ...prevState,
            [e.target.name]: e.target.value
        }));
    };

    const handleUnitChange = (selectedOption) => {
        setFilterUser(prevState => ({
            ...prevState,
            unit: selectedOption ? selectedOption.value : "" // 只存單一值
        }));
    };

    const handleRoleChange = (selectedOption) => {
        setFilterUser(prevState => ({
            ...prevState,
            role: selectedOption ? selectedOption.value : "" // 只存單一值
        }));
    };

    const roleOptions = [
        { value: "3", label: "管理者" },
        { value: "2", label: "編輯者" },
        { value: "1", label: "查看者" },
    ];

    useEffect(() => {
        console.log(filterUser)
    }, [filterUser])

    // 2️⃣ 監聽點擊外部事件
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

    return (
        <>
            <div
                ref={filterRef} // 3️⃣ 綁定 ref 到篩選面板
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
                        <input
                            type="text"
                            name="username"
                            className="filter-input"
                            placeholder="請輸入帳號..."
                            value={filterUser.username}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="filter-content">
                        <input
                            type="text"
                            name="name"
                            className="filter-input"
                            placeholder="請輸入姓名..."
                            value={filterUser.name}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <Select
                            className="filter-select"
                            options={users.map((user) => ({ value: user.unit, label: user.unit }))}
                            onChange={handleUnitChange}
                            placeholder="選擇單位..."
                            value={users.find(user => user.unit === filterUser.unit) ?
                                { value: filterUser.unit, label: filterUser.unit } : null}
                            isClearable={true}
                        />

                        <Select
                            className="filter-select"
                            options={roleOptions}
                            onChange={handleRoleChange}
                            placeholder="選擇權限..."
                            value={filterUser.role ? { value: filterUser.role, label: roleOptions.find(option => option.value === filterUser.role)?.label } : null}
                            isClearable={true}
                        />
                    </div>

                </div>

                <button className="filter-toggle-btn" onClick={() => setIsOpen(!isOpen)}>
                    篩選
                </button>
            </div>
        </>
    )
}

export default AccountFilter;