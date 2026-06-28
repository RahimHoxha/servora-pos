import { Text } from "react-thermal-printer";

export function ThreeColumnRow({
  left,
  center,
  right,
  width = 48,
}: {
  left: string;
  center: string;
  right: string;
  width?: number; // total line width (default 42 for 80mm printer)
}) {
  // Calculate space allocation
  const centerPosition = Math.floor((width - center.length) / 2);
  const rightStart = width - right.length;

  // Start with a blank line
  const line = Array(width).fill(" ");

  // Place left, center, and right texts
  line.splice(0, left.length, ...left.split(""));
  line.splice(centerPosition, center.length, ...center.split(""));
  line.splice(rightStart, right.length, ...right.split(""));

  return <Text>{line.join("")}</Text>;
}
