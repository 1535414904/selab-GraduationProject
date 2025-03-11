import React from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";

const GeneratePDFButton = ({ timeScaleRef, ganttChartRef }) => {
  const generatePDF = async () => {
    if (!timeScaleRef.current || !ganttChartRef.current) {
      console.error("參考的 DOM 元素不存在");
      alert("發生錯誤：無法找到 Gantt 圖表或時間刻度");
      return;
    }

    // **儲存原始狀態**
    const originalTimeScaleStyle = timeScaleRef.current.style.cssText;
    const originalGanttStyle = ganttChartRef.current.style.cssText;
    const originalScrollTop = ganttChartRef.current.scrollTop;

    try {
      // **步驟1: 調整時間刻度樣式**
      timeScaleRef.current.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: ${ganttChartRef.current.scrollWidth}px;
        height: 120px;
        visibility: visible;
        z-index: 999;
        background-color: #f0f0f0;
      `;

      // **步驟2: 調整甘特圖樣式**
      ganttChartRef.current.style.cssText = `
        position: relative;
        overflow: visible;
        height: ${ganttChartRef.current.scrollHeight}px;
        width: ${ganttChartRef.current.scrollWidth}px;
      `;
      
      // 確保滾動位置重置為頂部
      ganttChartRef.current.scrollTop = 0;

      // **等待樣式應用與重繪**
      await new Promise((resolve) => setTimeout(resolve, 500));

      // **步驟3: 擷取時間刻度畫布**
      const timeScaleCanvas = await html2canvas(timeScaleRef.current, {
        scale: 5, // 提高解析度
        useCORS: true,
        backgroundColor: "#f0f0f0",
        logging: false,
      });

      // **步驟4: 擷取甘特圖畫布**
      const ganttChartCanvas = await html2canvas(ganttChartRef.current, {
        scale: 1,
        useCORS: true,
        logging: false,
        width: ganttChartRef.current.scrollWidth,
        height: ganttChartRef.current.scrollHeight+300,
        backgroundColor: null,
        imageTimeout: 0,
        windowWidth: ganttChartRef.current.scrollWidth,
        windowHeight: ganttChartRef.current.scrollHeight+300,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        removeContainer: true
      });

      // **步驟5: 轉換為圖片**
      const timeScaleImgData = timeScaleCanvas.toDataURL("image/png", 1.0);
      const ganttChartImgData = ganttChartCanvas.toDataURL("image/png", 1.0);

      // **步驟6: 創建 PDF**
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [
          ganttChartCanvas.width + 50,
          ganttChartCanvas.height + 150,
        ],
      });

      // **步驟7: 計算並添加圖片**
      const pageWidth = pdf.internal.pageSize.getWidth();
      const timeScaleHeight = 100;
      const chartHeight = ganttChartCanvas.height;

      // **添加時間刻度**
      pdf.addImage(timeScaleImgData, "PNG", 10, 10, pageWidth - 20, timeScaleHeight, "", "FAST");

      // **添加甘特圖**
      pdf.addImage(ganttChartImgData, "PNG", 10, timeScaleHeight + 20, pageWidth - 20, chartHeight, "", "FAST");

      // **步驟8: 下載 PDF**
      pdf.save("gantt-chart.pdf");
    } catch (error) {
      console.error("生成 PDF 時發生錯誤:", error);
      alert("生成 PDF 時發生錯誤，請稍後再試");
    } finally {
      // 確保無論成功或失敗都恢復原始樣式和滾動位置
      timeScaleRef.current.style.cssText = originalTimeScaleStyle;
      ganttChartRef.current.style.cssText = originalGanttStyle;
      ganttChartRef.current.scrollTop = originalScrollTop;
    }
  };

  return (
    <button
      className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-colors duration-300"
      onClick={generatePDF}
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
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      生成 PDF
    </button>
  );
};

export default GeneratePDFButton;
