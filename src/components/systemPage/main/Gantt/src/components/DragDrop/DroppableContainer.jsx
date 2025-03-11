import React from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";
import RoomItem from "../ROOM/RoomItem";

function DroppableContainer({ room, roomIndex, isPinned }) {
  const fixedHeight = "60px";

  return (
    <Droppable
      droppableId={`droppable-${roomIndex}`}
      direction="horizontal"
      type="SURGERY_PAIR"
      isDropDisabled={isPinned}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          style={{
            display: "flex",
            flexDirection: "row",
            minHeight: fixedHeight,
            minWidth: "100px", // 確保空房間也有最小寬度
            background: snapshot.isDraggingOver
              ? "rgba(100, 0, 100, 0.5)"
              : isPinned ? "rgba(254, 226, 226, 0.4)" : "transparent",
            transition: "background 0.2s ease",
            position: "relative",
          }}
        >
          {isPinned && (
            <div 
              className="absolute inset-0 border-2 border-red-300 rounded-md pointer-events-none"
              style={{ zIndex: 1 }}
            ></div>
          )}
          
          {(room.data && room.data.length > 0
            ? Array.from({ length: Math.ceil(room.data.length / 2) })
            : [null]
          ).map((_, index) => {
            const itemIndex = index * 2;
            const surgery = room.data?.[itemIndex];
            const cleaning = room.data?.[itemIndex + 1];

            if (!surgery && index === 0) {
              // 返回一個空的佔位元素，確保空房間仍然可以接收拖曳
              return <div key="empty" style={{ height: fixedHeight }} />;
            }

            if (!surgery) return null;

            return (
              <Draggable
                key={`${surgery.id}-${itemIndex}`}
                draggableId={`draggable-${roomIndex}-${itemIndex}`}
                index={index}
                isDragDisabled={isPinned}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      display: "flex",
                      height: fixedHeight,
                      opacity: snapshot.isDragging ? 0.8 : 1,
                      zIndex: snapshot.isDragging ? 9999 : 'auto', // 當拖曳時，將 z-index 設置為最高值
                      cursor: isPinned ? 'not-allowed' : 'move',
                      ...provided.draggableProps.style,
                    }}
                  >
                    <RoomItem
                      item={surgery}
                      itemIndex={itemIndex}
                      roomIndex={roomIndex}
                      fixedHeight={fixedHeight}
                      isDragging={snapshot.isDragging}
                      isPinned={isPinned}
                    />
                    {cleaning && (
                      <RoomItem
                        item={cleaning}
                        itemIndex={itemIndex + 1}
                        roomIndex={roomIndex}
                        fixedHeight={fixedHeight}
                        isDragging={snapshot.isDragging}
                        isPinned={isPinned}
                      />
                    )}
                  </div>
                )}
              </Draggable>
            );
          })}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
}

export default DroppableContainer;
