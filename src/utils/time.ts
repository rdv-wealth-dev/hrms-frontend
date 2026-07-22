export const formatWorkedTime = (mins: number): string => {
  if (!mins || mins <= 0) return "0 mins";
  const hrs = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  if (hrs === 0) return `${remainingMins} mins`;
  return `${hrs}h ${remainingMins}m`;
};
