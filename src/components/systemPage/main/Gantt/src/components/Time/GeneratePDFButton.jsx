import React from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const GeneratePDFButton = ({ timeScaleRef, ganttChartRef }) => {
  const generatePDF = async () => {
    const originalTimeScaleStyle = timeScaleRef.current.style.cssText;
    const originalGanttStyle = ganttChartRef.current.style.cssText;
    const originalScrollTop = ganttChartRef.current.scrollTop;

    try {
      // 步驟1: 設置時間刻度的樣式
      timeScaleRef.current.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: ${ganttChartRef.current.scrollWidth}px;
        height: 150px;
        visibility: visible;
        z-index: 999;
        background-color: #f0f0f0;
      `;

      // 步驟2: 設置甘特圖容器的樣式
      ganttChartRef.current.style.cssText = `
        position: relative;
        overflow: visible;
        height: ${ganttChartRef.current.scrollHeight}px;
        width: ${ganttChartRef.current.scrollWidth}px;
      `;

      // 等待樣式應用和內容重繪
      await new Promise((resolve) => setTimeout(resolve, 300));

      // 步驟3: 擷取時間刻度
      const timeScaleCanvas = await html2canvas(timeScaleRef.current, {
        scale: 5,
        useCORS: true,
        logging: false,
        width: ganttChartRef.current.scrollWidth,
        height: 150, // 調整高度
        backgroundColor: "#f0f0f0",
        imageTimeout: 0,
        windowWidth: ganttChartRef.current.scrollWidth,
        windowHeight: 150,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          const timeScale = clonedDoc.querySelector(".time-scale");
          if (timeScale) {
            timeScale.style.height = "150px";
            timeScale.style.position = "relative";
            timeScale.style.display = "flex";
            timeScale.style.alignItems = "flex-start";

            // 調整刻度線的樣式
            const marks = timeScale.getElementsByClassName("time-scale-mark");
            Array.from(marks).forEach((mark) => {
              mark.style.visibility = "visible";
              mark.style.display = "flex";
              mark.style.height = "40px"; // 調整刻度線高度
              mark.style.position = "relative";
              mark.style.marginTop = "40px"; // 將刻度線移到下方
            });

            // 調整時間文字的樣式
            const timeTexts = timeScale.getElementsByClassName(
              "time-scale-hour-start"
            );
            Array.from(timeTexts).forEach((text) => {
              text.style.fontSize = "16px";
              text.style.position = "absolute";
              text.style.bottom = "30px"; // 將文字移到上方
              text.style.fontWeight = "600";
              text.style.color = "#000";
              text.style.visibility = "visible";
              text.style.display = "block";
              text.style.whiteSpace = "nowrap";
              text.style.transform = "translateX(-10%)"; // 文字置中對齊
            });
          }
        },
      });

      // 步驟4: 擷取甘特圖內容
      const ganttChartCanvas = await html2canvas(ganttChartRef.current, {
        scale: 1,
        useCORS: true,
        logging: false,
        width: ganttChartRef.current.scrollWidth,
        height: ganttChartRef.current.scrollHeight + 300,
        backgroundColor: null,
        imageTimeout: 0,
        windowWidth: ganttChartRef.current.scrollWidth,
        windowHeight: ganttChartRef.current.scrollHeight + 300,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        removeContainer: true,
      });

      // 轉換為圖片數據
      const timeScaleImgData = timeScaleCanvas.toDataURL("image/png", 1.0);
      const ganttChartImgData = ganttChartCanvas.toDataURL("image/png", 1.0);

      // 步驟5: 創建 PDF
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [ganttChartCanvas.width + 50, ganttChartCanvas.height + 50],
      });

      // 步驟6: 計算並保持正確的比例
      const pageWidth = pdf.internal.pageSize.getWidth();
      const timeScaleHeight = 80;
      const chartHeight = ganttChartCanvas.height;

      // 添加時間刻度到 PDF
      pdf.addImage(
        timeScaleImgData,
        "PNG",
        0,
        0,
        pageWidth,
        timeScaleHeight,
        "",
        "FAST"
      );

      // 添加甘特圖到 PDF
      pdf.addImage(
        ganttChartImgData,
        "PNG",
        0,
        timeScaleHeight,
        pageWidth,
        chartHeight,
        "",
        "FAST"
      );

      pdf.save("gantt-chart.pdf");
    } catch (error) {
      console.error("生成 PDF 時發生錯誤:", error);
      alert("生成 PDF 時發生錯誤，請稍後再試");
    } finally {
      // 恢復原始狀態
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
