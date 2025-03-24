import axios from "axios";
import { useState } from "react";
import { BASE_URL } from "../../../../../../../config";

const ORSMButton = () => {
    const [isLoading, setIsLoading] = useState(false);

    const handleRunAlgorithm = async (event) => {
    event.preventDefault();  // 防止表單提交時刷新頁面
    setIsLoading(true);

    try {
        // 呼叫後端 API 執行 .bat 檔案
        const response = await axios.get(`${BASE_URL}/api/system/algorithm/run`);
        window.alert(response.data);
    } catch (error) {
        window.alert('錯誤: ' + error.message);  // 顯示錯誤訊息
    } finally {
        setIsLoading(false);  // 完成後關閉加載狀態
    }
};


    return (
        <button
            type="button"
            className="flex items-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-colors duration-300"
            onClick={(e) => handleRunAlgorithm(e)}
            disabled={isLoading}
        >
            <svg
                className="h-4 w-4 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                />
            </svg>
            {isLoading ? '執行中...' : '開始排班'}
        </button>
    );
};

export default ORSMButton;
