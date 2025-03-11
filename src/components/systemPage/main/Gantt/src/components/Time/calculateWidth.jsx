export const calculateWidth = (startTime, endTime) => {
  // Helper function to convert time to minutes
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Handle special case for end time "24:00"
  const startMinutes = timeToMinutes(startTime);
  const endMinutes =
    endTime === "24:00"
      ? 24 * 60 // Special case for midnight
      : timeToMinutes(endTime);

  // Adjust to base time (8:30)
  const baseTime = 8 * 60 + 30; // 8:30

  // Calculate relative position to base time
  const relativeStart = startMinutes - baseTime;
  const duration = endMinutes - startMinutes;

  // Calculate width - 25px per 15 minutes (5/3 px per minute)
  const pixelsPerMinute = 25 / 15; // 1.67 px per minute
  const width = Math.max(duration * pixelsPerMinute, 25); // Ensure minimum width of 25px

  return {
    width: `${width}px`,
  };
};
