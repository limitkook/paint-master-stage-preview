export const BRUSH_RADIUS_SOURCE=10;
export const MIN_NUMBER_ZOOM=2.2;
export const MIN_NUMBER_CLEARANCE=12;
export const ALL_NUMBERS_ZOOM_FRACTION=.7;
export function labelVisible(region,zoom,sourceToScreenScale,maximumZoom=Infinity){return zoom>=maximumZoom*ALL_NUMBERS_ZOOM_FRACTION || zoom>=MIN_NUMBER_ZOOM && region.labelRadius*sourceToScreenScale>=MIN_NUMBER_CLEARANCE;}
export function brushRadiusFor(zoom,multiplier=1){if(![.5,1,2].includes(multiplier))throw Error("잘못된 붓 크기");return BRUSH_RADIUS_SOURCE*multiplier/Math.sqrt(Math.max(1,zoom));}
