import axios from "axios";
import { BASE_URL } from "../../../../../../config";
import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

/* eslint-disable react/prop-types */
function ChiefSurgeonHeaderWrapper({ setChiefSurgeon,
    pageState, toggleState,
    filterChiefSurgeon, setFilterChiefSurgeon,
    deleteMode, setDeleteMode,
    selectChiefSurgeons, setSelectChiefSurgeons,
    addHandleSubmit,
    departmentId, setDepartmentId,
    setEmptyError }) {

    const handleChange = (e) => {
        setFilterChiefSurgeon(prevState => ({
            ...prevState,
            [e.value.name]: e.target.value
        }));
    };

    useEffect(() => {
        console.log("選擇的醫生：", selectChiefSurgeons);
    }, [selectChiefSurgeons])

    const handleDelete = async () => {
        if (selectChiefSurgeons.length === 0) {
            alert("請選擇要刪除的帳戶");
            return;
        }
        try {
            await axios.delete(`${BASE_URL}/api/system/chief-surgeons/delete`, {
                data: selectChiefSurgeons
            });
            const response = await axios.get(`${BASE_URL}/api/system/department/${departmentId}/chief-surgeons`);
            setChiefSurgeon(response.data);
            setSelectChiefSurgeons([]);
            setDeleteMode(false);
        } catch (error) {
            console.log("ChiefSurgeon delete error: ", error)
        }
    }

    const handleBack = () => {
        toggleState("list");
        setEmptyError(null);
    }

    return (
        <div className="header-wrapper">
            <div className="title">
                {/* 圖示部分 */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-6 h-6 mr-2" // 設定大小 & 右邊留空間
                    style={{ width: "1em", height: "1em" }} // 讓 SVG 隨字體大小變化
                >
                    <path
                        strokeLinecap="round" // ✅ 修正為 React 適用的 camelCase
                        strokeLinejoin="round" // ✅ 修正為 React 適用的 camelCase
                        d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z"
                    />
                </svg>
                <h1>科別管理</h1>
            </div>

            {pageState === "list" && (
                <div className="header-function">
                    <FontAwesomeIcon className="filter" icon={faMagnifyingGlass} />

                    <input
                        type="text"
                        name="id"
                        placeholder="請輸入編號"
                        value={filterChiefSurgeon.id}
                        onChange={handleChange}
                    />

                    <input
                        type="text"
                        name="name"
                        placeholder="請輸入名稱"
                        value={filterChiefSurgeon.name}
                        onChange={handleChange}
                    />
                    {!deleteMode && <button className="account-button chief-surgeon-right-button" onClick={() => setDepartmentId("")}>返回</button>}
                    {!deleteMode && <button className="account-button" onClick={() => toggleState("add")}>新增</button>}

                    {!deleteMode ? (
                        <button className="account-button mgr-cancel" onClick={() => setDeleteMode(true)}>刪除</button>
                    ) : (
                        <div>
                            <button className="account-button department-right-button" onClick={handleDelete}>確認</button>
                            <button className="account-button mgr-cancel" onClick={() => setDeleteMode(false)}>取消</button>
                        </div>
                    )}
                </div>
            )}

            {pageState === "add" && (
                <div>
                    <button className="account-button" onClick={addHandleSubmit}>確認</button>
                    <button className="account-button mgr-cancel" onClick={handleBack}>返回</button>
                </div>
            )
            }
        </div >
    )
}

export default ChiefSurgeonHeaderWrapper;