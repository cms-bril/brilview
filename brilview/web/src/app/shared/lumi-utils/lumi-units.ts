export function isInstantaneousUnit(unit) {
    return unit.toLowerCase().startsWith('hz/');
}

export function unitsConflict(unit1, unit2) {
    return (isInstantaneousUnit(unit1) !== isInstantaneousUnit(unit2));
}

export const unitMultiplier = {
    '/b': 1,
    '/mb': 1000,
    '/ub': 1000000,
    '/nb': 1000000000,
    '/pb': 1000000000000,
    '/fb': 1000000000000000,
    'Hz/b': 1,
    'Hz/mb': 1000,
    'Hz/ub': 1000000,
    'Hz/nb': 1000000000,
    'Hz/pb': 1000000000000,
    'Hz/fb': 1000000000000000
};

export const integratedUnits = [
    '/b', '/mb', '/ub', '/nb', '/pb', '/fb'
];

export const instantaneousUnits = [
    'Hz/b', 'Hz/mb', 'Hz/ub', 'Hz/nb', 'Hz/pb', 'Hz/fb'
];

export function scaleUnit(unit1, unit2) {
    if (unitsConflict(unit1, unit2)) {
        return -1;
    }
    unit1 = normalizeUnit(unit1);
    unit2 = normalizeUnit(unit2);
    return unitMultiplier[unit1] / unitMultiplier[unit2];
}

export function normalizeUnit(unit) {
    const normalized = unit.toLowerCase();
    if (normalized.startsWith('hz/')) {
        return normalized.replace('hz/', 'Hz/');
    }
    return normalized;
}

export function stepUnit(unit, direction) {
    unit = normalizeUnit(unit);
    direction = (direction.toLowerCase() === 'down' ? -1 : 1);
    let units;
    if (isInstantaneousUnit(unit)) {
        units = instantaneousUnits;
    } else {
        units = integratedUnits;
    }
    const index = units.indexOf(unit);
    if (index < 0) {
        throw new Error('Unknonwn unit ' + unit);
    }
    if ((direction > 0 && index < units.length - 1) ||
        (direction < 0 && index > 0)) {
        return units[index + direction];
    }
    return unit;
}

export function unitForData(maxValue, currentUnit) {
    if (!Number.isFinite(maxValue)) {
        return currentUnit;
    }
    let units = integratedUnits;
    if (isInstantaneousUnit(currentUnit)) {
        units = instantaneousUnits;
    }
    let newUnit = currentUnit;
    while (maxValue > 1000 && newUnit !== units[units.length - 1 ]) {
        maxValue = maxValue / 1000;
        newUnit = stepUnit(newUnit, 'up');
    }
    while (maxValue < 1 && newUnit !== units[0]) {
        maxValue = maxValue * 1000;
        newUnit = stepUnit(newUnit, 'down');
    }
    return newUnit;
}
