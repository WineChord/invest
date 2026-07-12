import type { IChartApi } from "lightweight-charts";

export function observeChartSize(
  chart: IChartApi,
  container: HTMLElement,
  afterResize?: () => void,
) {
  let appliedWidth = 0;
  const resize = () => {
    const width = Math.max(1, Math.floor(container.getBoundingClientRect().width));
    if (width === appliedWidth) {
      return;
    }
    appliedWidth = width;
    chart.applyOptions({ width });
    afterResize?.();
  };

  resize();
  const observer =
    typeof ResizeObserver === "undefined" ? null : new ResizeObserver(resize);
  observer?.observe(container);
  window.addEventListener("resize", resize);

  return () => {
    observer?.disconnect();
    window.removeEventListener("resize", resize);
  };
}
