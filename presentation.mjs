export const BRUSH_RADIUS_SOURCE=10;
export const MIN_NUMBER_ZOOM=2.2;
export const MIN_NUMBER_CLEARANCE=12;
export function labelVisible(region,zoom,sourceToScreenScale){return zoom>=MIN_NUMBER_ZOOM && region.labelRadius*sourceToScreenScale>=MIN_NUMBER_CLEARANCE;}
