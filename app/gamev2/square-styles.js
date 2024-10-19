export const grayedOutStyles = {
  opacity: 0.4,
};
export const highlightedStyles = {
  backgroundColor: "hsla(150, 70%, 50%, 0.4)",
  border: "2px solid hsl(150, 70%, 50%)",
};
export const highlightedCapturedStyles = {
  backgroundColor: "hsla(10, 70%, 50%, 0.4)",
  border: "2px solid hsl(10, 70%, 50%)",
};
export const markedStyles = {
  backgroundColor: "rgba(0, 0, 255, 0.4)",
};
export const selectedStyles = {
  border: "2px solid hsl(150, 70%, 50%)",
  borderBottomColor: "transparent",
};
export const historyStyles = {
  backgroundColor: "rgba(255, 255, 0, 0.2)",
};
export const checkStyles = {
  backgroundColor:
    "repeating-linear-gradient(45deg, hsl(0, 0%, 0%), hsl(0, 0%, 0%) 10px, hsl(0, 0%, 0%) 10px, hsl(0, 0%, 0%) 20px)",
};
export const staleStyles = {
  backgroundColor:
    "repeating-linear-gradient(45deg, hsl(0, 0%, 0%), hsl(0, 0%, 0%) 10px, hsl(0, 0%, 0%) 10px, hsl(0, 0%, 0%) 20px)",
};

export const styles = (selectors, ...styles) => {
  const mergedStyles = {};

  selectors.forEach((selector) => {
    mergedStyles[selector] = styles.reduce(
      (acc, style) => ({ ...acc, ...style }),
      {}
    );
  });

  return mergedStyles;
};
