export function formatTime(input: string) {
  const numbers = input.replace(/\D/g, "").slice(-6);
  const padded = numbers.padStart(6, "0");

  const hours = padded.slice(0, 2);
  const minutes = padded.slice(2, 4);
  const seconds = padded.slice(4, 6);

  return `${hours}:${minutes}:${seconds}`;
}

export function timerToMs(timer: string): number {
  const [hours, minutes, seconds] = timer.split(":").map(Number);
  return (hours * 3600 + minutes * 60 + seconds) * 1000;
}
