import { calculateDuration, addMinutesToTime } from '../Time/timeUtils';
import { getColorByEndTime, getCleaningColor } from '../ROOM/colorUtils';        

export const handleDragEnd = (result, rows, setRows) => {
  const { source, destination } = result;
  if (!destination) return;

  const sourceRoomIndex = parseInt(source.droppableId.split("-")[1], 10);
  const destinationRoomIndex = parseInt(destination.droppableId.split("-")[1], 10);
  
  const sourceIndex = source.index * 2;
  const destinationIndex = destination.index * 2;
  
  const newRows = [...rows];

  if (sourceRoomIndex === destinationRoomIndex) {
    handleSameRoomDrag(newRows, sourceRoomIndex, sourceIndex, destinationIndex);
  } else {
    handleCrossRoomDrag(newRows, sourceRoomIndex, destinationRoomIndex, sourceIndex, destinationIndex);
  }

  setRows(newRows);
};

const handleSameRoomDrag = (newRows, roomIndex, sourceIndex, destinationIndex) => {
  const roomData = newRows[roomIndex].data;
  
  const movedItems = roomData.splice(sourceIndex, 2);
  
  let targetIndex = destinationIndex % 2 !== 0 ? destinationIndex - 1 : destinationIndex;
  
  if (targetIndex >= roomData.length) {
    roomData.push(...movedItems);
  } else {
    roomData.splice(targetIndex, 0, ...movedItems);
  }

  updateRoomTimes(roomData);
};

const handleCrossRoomDrag = (newRows, sourceRoomIndex, destRoomIndex, sourceIndex, destinationIndex) => {
  if (!newRows[sourceRoomIndex].data) {
    newRows[sourceRoomIndex].data = [];
  }
  if (!newRows[destRoomIndex].data) {
    newRows[destRoomIndex].data = [];
  }

  const sourceRoomData = newRows[sourceRoomIndex].data;
  const destRoomData = newRows[destRoomIndex].data;
  
  const movedItems = sourceRoomData.splice(sourceIndex, 2);
  const surgeryDuration = calculateDuration(movedItems[0].startTime, movedItems[0].endTime);

  if (sourceRoomData.length > 0) {
    updateRoomTimes(sourceRoomData);
  }

  let targetIndex = destinationIndex;
  const prevEndTime = targetIndex === 0 ? "08:30" : 
    (destRoomData.length === 0 ? "08:30" : 
    (targetIndex >= destRoomData.length ? destRoomData[destRoomData.length - 1].endTime : 
    destRoomData[targetIndex - 1].endTime));

  movedItems[0].startTime = prevEndTime;
  movedItems[0].endTime = addMinutesToTime(prevEndTime, surgeryDuration);
  movedItems[0].color = getColorByEndTime(movedItems[0].endTime, false);
  movedItems[1].startTime = movedItems[0].endTime;
  movedItems[1].endTime = addMinutesToTime(movedItems[0].endTime, 45);
  movedItems[1].color = getColorByEndTime(movedItems[1].endTime, true);

  if (targetIndex >= destRoomData.length) {
    destRoomData.push(...movedItems);
  } else {
    destRoomData.splice(targetIndex, 0, ...movedItems);
  }

  updateRoomTimes(destRoomData);
};

const updateRoomTimes = (roomData) => {
  let currentTime = "08:30";
  
  for (let i = 0; i < roomData.length; i += 2) {
    const surgery = roomData[i];
    const surgeryDuration = calculateDuration(surgery.startTime, surgery.endTime);
    
    surgery.startTime = currentTime;
    surgery.endTime = addMinutesToTime(currentTime, surgeryDuration);
    surgery.color = getColorByEndTime(surgery.endTime, false);
    
    if (i + 1 < roomData.length) {
      const cleaning = roomData[i + 1];
      cleaning.startTime = surgery.endTime;
      cleaning.endTime = addMinutesToTime(surgery.endTime, 45);
      cleaning.color = getCleaningColor();
      currentTime = cleaning.endTime;
    }
  }
};