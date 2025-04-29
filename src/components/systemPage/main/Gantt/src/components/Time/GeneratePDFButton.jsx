import React from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";

const GeneratePDFButton = ({ timeScaleRef, ganttChartRef }) => {
  const generatePDF = async () => {
    if (!timeScaleRef.current || !ganttChartRef.current) {
      console.error("參考的 DOM 元素不存在！");
      alert("無法找到甘特圖或時間刻度，請稍後再試");
      return;
    }

    try {
      // 展開滾動區域
      const originalTimeScaleStyle = timeScaleRef.current.style.cssText;
      const originalGanttStyle = ganttChartRef.current.style.cssText;
      timeScaleRef.current.style.overflow = "visible";
      ganttChartRef.current.style.overflow = "visible";

      await new Promise(resolve => setTimeout(resolve, 300)); // 等待樣式刷新

      // 使用較合理的縮放比以控制檔案大小
      const scale = 1.5;

      // 擷取時間刻度 canvas
      const timeScaleCanvas = await html2canvas(timeScaleRef.current, {
        scale: scale,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      // 擷取甘特圖 canvas
      const ganttCanvas = await html2canvas(ganttChartRef.current, {
        scale: scale,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      // 使用 A4 尺寸
      // A4 在 jsPDF 中的尺寸為 210 x 297 mm
      const pdf = new jsPDF({
        orientation: "landscape", // 橫向 A4
        unit: "mm",
        format: "a4",
      });

      // 取得 PDF 頁面的尺寸
      const pageWidth = pdf.internal.pageSize.getWidth(); // 寬度 (297mm 在橫向)
      const pageHeight = pdf.internal.pageSize.getHeight(); // 高度 (210mm 在橫向)

      // 保留頁面邊距
      const margin = 10; // 10mm 邊距
      const usableWidth = pageWidth - (margin * 2);
      const usableHeight = pageHeight - (margin * 2);

      // 計算時間刻度在 PDF 中的高度
      const timeScaleRatio = timeScaleCanvas.height / timeScaleCanvas.width;
      const timeScaleHeight = usableWidth * timeScaleRatio;

      // 將甘特圖分割成多頁
      const ganttRatio = ganttCanvas.height / ganttCanvas.width;
      const ganttHeightInPDF = usableWidth * ganttRatio;

      let position = 0;
      let isFirstPage = true;

      // 處理時間刻度和第一部分的甘特圖
      const firstPageGanttHeight = usableHeight - timeScaleHeight;
      const firstPageGanttPercent = firstPageGanttHeight / ganttHeightInPDF;
      const firstPageCanvasHeight = Math.floor(ganttCanvas.height * firstPageGanttPercent);

      // 加時間刻度在第一頁頂部
      pdf.addImage(
        timeScaleCanvas.toDataURL("image/jpeg", 0.9), // 使用 JPEG 並設定品質為 0.9 以減少檔案大小
        "JPEG",
        margin,
        margin,
        usableWidth,
        timeScaleHeight
      );

      // 如果甘特圖非常短，可能在第一頁就完成
      if (firstPageCanvasHeight >= ganttCanvas.height) {
        pdf.addImage(
          ganttCanvas.toDataURL("image/jpeg", 0.9),
          "JPEG",
          margin,
          margin + timeScaleHeight,
          usableWidth,
          ganttHeightInPDF
        );
      } else {
        // 擷取第一頁的甘特圖部分
        const firstPagePartialCanvas = document.createElement("canvas");
        const firstPageContext = firstPagePartialCanvas.getContext("2d");
        firstPagePartialCanvas.width = ganttCanvas.width;
        firstPagePartialCanvas.height = firstPageCanvasHeight;

        firstPageContext.drawImage(
          ganttCanvas,
          0,
          0,
          ganttCanvas.width,
          firstPageCanvasHeight,
          0,
          0,
          ganttCanvas.width,
          firstPageCanvasHeight
        );

        pdf.addImage(
          firstPagePartialCanvas.toDataURL("image/jpeg", 0.9),
          "JPEG",
          margin,
          margin + timeScaleHeight,
          usableWidth,
          firstPageGanttHeight
        );

        position = firstPageCanvasHeight;

        // 處理剩餘的甘特圖部分
        while (position < ganttCanvas.height) {
          pdf.addPage();

          const remainingHeight = ganttCanvas.height - position;
          const heightToUse = Math.min(
            remainingHeight,
            Math.floor(ganttCanvas.height * (usableHeight / ganttHeightInPDF))
          );

          const partialCanvas = document.createElement("canvas");
          const context = partialCanvas.getContext("2d");
          partialCanvas.width = ganttCanvas.width;
          partialCanvas.height = heightToUse;

          context.drawImage(
            ganttCanvas,
            0,
            position,
            ganttCanvas.width,
            heightToUse,
            0,
            0,
            ganttCanvas.width,
            heightToUse
          );

          pdf.addImage(
            partialCanvas.toDataURL("image/jpeg", 0.9),
            "JPEG",
            margin,
            margin,
            usableWidth,
            (heightToUse / ganttCanvas.height) * ganttHeightInPDF
          );

          position += heightToUse;
        }
      }

      // 自動加日期
      const today = new Date();
      const fileName = `gantt-chart-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}.pdf`;

      pdf.save(fileName);

      // 恢復原本樣式
      timeScaleRef.current.style.cssText = originalTimeScaleStyle;
      ganttChartRef.current.style.cssText = originalGanttStyle;
    } catch (error) {
      console.error("生成 PDF 失敗：", error);
      alert("生成 PDF 失敗，請稍後再試！");
    }
  };

  return (
    <button
      className="gantt-buttons flex items-center bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-colors duration-300"
      onClick={generatePDF}
    >
      <svg className="h-6 w-6 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      生成 PDF
    </button>
  );
};

export default GeneratePDFButton;