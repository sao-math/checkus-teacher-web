export const colors = {
  primary: 'gray-900',    // Point color - default gray
  background1: 'gray-50', // Light background
  background2: 'white',   // White background
};

// Helper function to get color class
export const getColorClass = (type: string, shade: string = '') => {
  const baseColor = colors[type as keyof typeof colors];
  return `${shade}${baseColor}`;
};