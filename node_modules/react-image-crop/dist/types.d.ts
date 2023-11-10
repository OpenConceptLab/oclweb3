export interface CropObject {
    aspect?: number;
    x: number;
    y: number;
    width: number;
    height: number;
    unit?: CropUnit;
}
export declare type CropOrd = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';
export declare type OffsetCoords = {
    top: number;
    left: number;
};
export declare type CropUnit = 'px' | '%';
