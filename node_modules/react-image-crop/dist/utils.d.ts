import { CropObject, CropOrd, OffsetCoords } from './types';
interface PartialCropObjectW extends Omit<CropObject, 'width'> {
    width?: number;
}
interface PartialCropObjectH extends Omit<CropObject, 'height'> {
    height?: number;
}
declare type PartialCropObject = PartialCropObjectW | PartialCropObjectH;
export declare function clamp(num: number, min: number, max: number): number;
export declare function isCropDrawn(crop?: CropObject): number | undefined;
export declare function makeAspectCrop(crop: PartialCropObject, imageWidth: number, imageHeight: number): CropObject;
export declare function convertToPercentCrop(crop: CropObject, imageWidth: number, imageHeight: number): CropObject;
export declare function convertToPixelCrop(crop: CropObject, imageWidth: number, imageHeight: number): CropObject;
export declare function containCrop(prevCrop: CropObject, crop: CropObject, imageWidth: number, imageHeight: number): {
    aspect?: number | undefined;
    x: number;
    y: number;
    width: number;
    height: number;
    unit?: import("./types").CropUnit | undefined;
};
export declare function straightenYPath(clientX: number, ord: CropOrd, cropOffset: OffsetCoords, cropStartWidth: number, cropStartHeight: number): number;
export {};
