import React from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";
import RoomItem from "../ROOM/RoomItem";

function DroppableContainer({ room, roomIndex, isPinned, roomName }) {
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
            minWidth: "100px",
            background: snapshot.isDraggingOver
              ? "rgba(100, 0, 100, 0.5)"
              : isPinned ? "rgba(254, 226, 226, 0.4)" : "transparent",
            transition: "background 0.2s ease",
            position: "relative",
            zIndex: snapshot.isDraggingOver ? 1 : "auto",
          }}
        >
          {isPinned && (
            <div 
              className="absolute inset-0 border-2 border-red-300 rounded-md pointer-events-none"
              style={{ zIndex: 0 }}
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
              return <div key="empty" style={{ height: fixedHeight, minWidth: "50px" }} />;
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
                      opacity: snapshot.isDragging ? 0.9 : 1,
                      zIndex: snapshot.isDragging ? 9999 : 1,
                      cursor: isPinned ? 'not-allowed' : 'move',
                      position: "relative",
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
                      roomName={roomName}
                    />
                    {cleaning && (
                      <RoomItem
                        item={cleaning}
                        itemIndex={itemIndex + 1}
                        roomIndex={roomIndex}
                        fixedHeight={fixedHeight}
                        isDragging={snapshot.isDragging}
                        isPinned={isPinned}
                        roomName={roomName}
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
