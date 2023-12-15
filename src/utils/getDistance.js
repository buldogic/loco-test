const toRadian = (degree) => degree*Math.PI/180;


export const getDistance = (from, to) => {
    const deltaLat = to.lat - from.lat;
    const deltaLon = to.lng - from.lng;

    const a = Math.pow(Math.sin(deltaLat/2), 2) + Math.cos(from.lat) * Math.cos(to.lat) * Math.pow(Math.sin(deltaLon/2), 2);
    const c = 2 * Math.asin(Math.sqrt(a));
    const EARTH_RADIUS = 6371;
    return c * EARTH_RADIUS * 1000;
}

