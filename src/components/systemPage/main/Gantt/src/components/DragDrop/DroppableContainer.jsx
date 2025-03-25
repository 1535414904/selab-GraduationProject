import React from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";
import RoomItem from "../ROOM/RoomItem";
import Group from "../ROOM/Group";

function DroppableContainer({ 
  room, 
  roomIndex, 
  isPinned, 
  roomName, 
  readOnly = false, 
  onSurgeryClick, 
  isGroupMode = false,
  isUngroupMode = false,
  selectedSurgeries = [],
  isMainPage = false 
}) {
  const fixedHeight = "60px";

  // 確保每個項目都有唯一的 ID
  const ensureUniqueId = (item, index) => {
    // 如果項目已經有 ID，則使用它，否則使用索引作為 ID
    return item.id || `generated-id-${roomIndex}-${index}`;
  };

  // 檢查手術是否被選中
  const isSurgerySelected = (surgery) => {
    return selectedSurgeries.some(s => s.id === surgery.id);
  };

  // 渲染群組項目
  const renderGroupItem = (group, index) => {
    if (!group.isGroup) return null;

    return (
      <Group
        key={`group-${group.id}`}
        group={group}
        roomIndex={roomIndex}
        fixedHeight={fixedHeight}
        isDragging={false}
        isPinned={isPinned}
        roomName={roomName}
        readOnly={readOnly && !isUngroupMode} // 在解除模式下允許點擊
        onSurgeryClick={onSurgeryClick}
        isUngroupMode={isUngroupMode}
      />
    );
  };

  // 渲染普通手術項目
  const renderSurgeryItem = (surgery, itemIndex, cleaning) => {
    const isSelected = isGroupMode && isSurgerySelected(surgery);
    
    return (
      <div
        key={`${ensureUniqueId(surgery, itemIndex)}-${itemIndex}`}
        style={{
          display: "flex",
          height: fixedHeight,
          position: "relative",
        }}
      >
        <RoomItem
          item={surgery}
          itemIndex={itemIndex}
          roomIndex={roomIndex}
          fixedHeight={fixedHeight}
          isDragging={false}
          isPinned={isPinned}
          roomName={roomName}
          readOnly={readOnly || isGroupMode}
          onSurgeryClick={onSurgeryClick}
          isSelected={isSelected}
          isGroupMode={isGroupMode}
          isUngroupMode={isUngroupMode}
          isMainPage={isMainPage}
        />
        {cleaning && (
          <RoomItem
            item={cleaning}
            itemIndex={itemIndex + 1}
            roomIndex={roomIndex}
            fixedHeight={fixedHeight}
            isDragging={false}
            isPinned={isPinned}
            roomName={roomName}
            readOnly={readOnly || isGroupMode}
            onSurgeryClick={onSurgeryClick}
            isGroupMode={isGroupMode}
            isUngroupMode={isUngroupMode}
            isMainPage={isMainPage}
          />
        )}
      </div>
    );
  };

  // 如果是只讀模式或群組模式或解除模式，直接渲染不可拖動的內容
  if (readOnly || isGroupMode || isUngroupMode) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          minHeight: fixedHeight,
          minWidth: "100px",
          position: "relative",
          background: !isMainPage && isPinned ? "rgba(254, 226, 226, 0.4)" : "transparent",
        }}
      >
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

          // 如果是群組，渲染群組
          if (surgery.isGroup) {
            return renderGroupItem(surgery, itemIndex);
          }

          // 否則渲染普通手術
          return renderSurgeryItem(surgery, itemIndex, cleaning);
        })}
      </div>
    );
  }

  // 否則，使用拖放功能
  return (
    <Droppable
      droppableId={`droppable-${roomIndex}`}
      direction="horizontal"
      type="SURGERY_PAIR"
      isDropDisabled={!isMainPage && isPinned}
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
              : !isMainPage && isPinned ? "rgba(254, 226, 226, 0.4)" : "transparent",
            transition: "background 0.2s ease",
            position: "relative",
            zIndex: snapshot.isDraggingOver ? 1 : "auto",
          }}
        >
          {!isMainPage && isPinned && (
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
            
            // 如果是群組，使用特殊的群組渲染邏輯
            if (surgery.isGroup) {
              return (
                <Draggable
                  key={`draggable-group-${surgery.id}`}
                  draggableId={`draggable-group-${surgery.id}`}
                  index={index}
                  isDragDisabled={!isMainPage && isPinned}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        height: fixedHeight,
                        opacity: snapshot.isDragging ? 0.9 : 1,
                        zIndex: snapshot.isDragging ? 9999 : 1,
                        cursor: !isMainPage && isPinned ? 'not-allowed' : 'move',
                        ...provided.draggableProps.style,
                      }}
                    >
                      {renderGroupItem(surgery, itemIndex)}
                    </div>
                  )}
                </Draggable>
              );
            }
            
            // 為拖曳項目生成唯一 ID
            const draggableId = `draggable-${roomIndex}-${index}`;
            const surgeryId = ensureUniqueId(surgery, itemIndex);

            return (
              <Draggable
                key={draggableId}
                draggableId={draggableId}
                index={index}
                isDragDisabled={!isMainPage && isPinned}
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
                      cursor: !isMainPage && isPinned ? 'not-allowed' : 'move',
                      position: "relative",
                      ...provided.draggableProps.style,
                    }}
                  >
                    <RoomItem
                      item={{...surgery, id: surgeryId}}
                      itemIndex={itemIndex}
                      roomIndex={roomIndex}
                      fixedHeight={fixedHeight}
                      isDragging={snapshot.isDragging}
                      isPinned={isPinned}
                      roomName={roomName}
                      onSurgeryClick={onSurgeryClick}
                      isMainPage={isMainPage}
                    />
                    {cleaning && (
                      <RoomItem
                        item={{...cleaning, id: ensureUniqueId(cleaning, itemIndex + 1)}}
                        itemIndex={itemIndex + 1}
                        roomIndex={roomIndex}
                        fixedHeight={fixedHeight}
                        isDragging={snapshot.isDragging}
                        isPinned={isPinned}
                        roomName={roomName}
                        onSurgeryClick={onSurgeryClick}
                        isMainPage={isMainPage}
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
