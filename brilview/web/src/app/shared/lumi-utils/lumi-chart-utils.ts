import * as LumiUnits from './lumi-units';
declare var Plotly: any;

export function recalculateLumiUnit(chart, chartUnit) {
    if (!chartUnit) {
        return null;
    }
    const currentChartMax = getMaxChartValue(chart.chartData);
    return LumiUnits.unitForData(currentChartMax, chartUnit);
}


export function scaleLumiValues(values: Array<number>, currentUnit, newUnit) {
    if (currentUnit === newUnit) {
        return values;
    }
    const scale = LumiUnits.scaleUnit(currentUnit, newUnit);
    return values.map((val) => val * scale);
}


export function rescaleChartLumiValues(chart, chartUnit) {
    const newUnit = recalculateLumiUnit(chart, chartUnit);
    if (newUnit !== chartUnit) {
        for (const series of chart.chartData) {
            series.y = scaleLumiValues(series.y, chartUnit, newUnit);
        }
        chart.redraw();
    }
    return newUnit;
}


export function getMaxChartValue(data) {
    let max = -Infinity;
    for (const series of data) {
        for (const val of series.y) {
            if (val > max) {
                max = val;
            }
        }
    }
    return max;
}


export const yZoom0to3Icon = {
    'width': 800,
    'ascent': 850,
    'descent': -150,
    'path': 'M0 193.76L400 376.47L800 193.76L546.42 193.76L546.42 0 ' +
        'L252.92 0L252.92 193.76L0 193.76Z M800 606.24L400 423.53L0 606.24 ' +
        'L253.58 606.24L253.58 800L547.08 800L547.08 606.24L800 606.24Z'
}


export const buttonYZoom0to3 = {
    name: 'y0to3',
    title: 'Zoom Y axis 0;3',
    icon: yZoom0to3Icon,
    click: function(gd) {
        const opts = gd.layout;
        if (!opts.yaxis) {
            return;
        }
        opts.yaxis.range = [0, 3];
        opts.yaxis.autorange = false;
        Plotly.relayout(gd, opts);
    }
}


export const buttonDownloadImage = {
    name: 'toImage',
    title: 'Download plot as a png',
    icon: Plotly.Icons.camera,
    click: function(gd) {
        const opts = {
            format: 'png',
            width: 1200,
            height: 700
        };
        Plotly.downloadImage(gd, opts);
    }
}
