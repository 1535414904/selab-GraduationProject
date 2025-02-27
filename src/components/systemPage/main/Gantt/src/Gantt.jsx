import React, { useRef, useEffect, useState } from "react";
import RoomSection from "./components/ROOM/RoomSection";
import TimeWrapper from "./components/Time/timeWrapper";
import GeneratePDFButton from "./components/Time/GeneratePDFButton";
import { fetchSurgeryData } from "./components/Data/ganttData";
import "./styles.css";


// 將 rows 和 setRows 作為 props 接收
function Gantt({ rows, setRows }) {
  const ganttChartRef = useRef(null);
  const timeScaleRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSurgeryData(setRows, setLoading, setError);
  }, []);

  return (
    <div className="container">
      {loading && <div className="loading">加載中...</div>}
      {error && <div className="error-message">{error}</div>}
      {!loading && !error && rows && rows.length > 0 && (
        <>
          <GeneratePDFButton
            timeScaleRef={timeScaleRef}
            ganttChartRef={ganttChartRef}
          />
          <div className="scroll-container">
            <div ref={timeScaleRef}>
              <TimeWrapper>
                <div ref={ganttChartRef}>
                  {rows.map((room, roomIndex) => (
                    <div key={room.room || roomIndex} className="row">
                      <RoomSection room={room} roomIndex={roomIndex} />
                    </div>
                  ))}
                </div>
              </TimeWrapper>
            </div>
          </div>
        </>
      )}
      {!loading && !error && (!rows || rows.length === 0) && (
        <div className="no-data">尚無排程資料</div>
      )}
    </div>
  );
}

export default Gantt;