export const formatTime = (date: string, time: string) => {
  return `${date.split("T")[0]}T${time.split("T")[1]}`.replace("Z", "");
};

export const nodeWidth = 150;
export const nodeHeight = 60;
