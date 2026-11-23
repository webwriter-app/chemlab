import { Chart, LinearScale, LineController, LineElement, PointElement, Tooltip } from "chart.js";

/**
 * Chart.js instance limited to the parts a ChemLab diagram uses
 *
 * Every diagram draws line datasets on linear axes with points, and the
 * measurement cards rely on the tooltip. Registering those parts instead of
 * importing `chart.js/auto` drops the unused controllers, the radial and
 * category scales, the filler, the legend, decimation and the colour plugin: the
 * lab entry shrinks by about 110 kB with the same chart configuration. Options
 * that belong to an unregistered plugin are inert, so `plugins.legend.display`
 * costs nothing while the legend stays hidden as intended.
 *
 * `tests/diagram-chart.test.ts` holds the list against the chart configuration.
 */
Chart.register(LineController, LineElement, PointElement, LinearScale, Tooltip);

export { Chart };
