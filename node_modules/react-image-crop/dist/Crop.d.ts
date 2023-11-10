import React, { PureComponent } from 'react';
import { CropObject, CropOrd, OffsetCoords, CropUnit } from './types';
import './Crop.scss';
interface CropProps {
    crop?: CropObject;
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
    disabled?: boolean;
    locked?: boolean;
    circularCrop?: boolean;
    keepSelection?: boolean;
    ruleOfThirds?: boolean;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    onChange: (pixelCrop: CropObject, percentCrop: CropObject) => void;
    onComplete?: (pixelCrop: CropObject, percentCrop: CropObject) => void;
    onDragStart?: (e: PointerEvent) => void;
    onDragEnd?: (e: PointerEvent) => void;
}
interface CropState {
    dimensions: {
        width: number;
        height: number;
    };
    cropIsActive?: boolean;
    newCropIsBeingDrawn?: boolean;
}
interface EvData {
    clientStartX: number;
    clientStartY: number;
    cropStartWidth: number;
    cropStartHeight: number;
    cropStartX: number;
    cropStartY: number;
    xDiff: number;
    yDiff: number;
    xInversed: boolean;
    yInversed: boolean;
    xCrossOver: boolean;
    yCrossOver: boolean;
    startXCrossOver: boolean;
    startYCrossOver: boolean;
    isResize: boolean;
    ord: CropOrd;
    cropOffset: OffsetCoords;
    lastYCrossover?: boolean;
}
export declare const EMPTY_CROP: CropObject;
export declare class Crop extends PureComponent<CropProps, CropState> {
    static xOrds: string[];
    static yOrds: string[];
    static xyOrds: string[];
    static nudgeStep: number;
    static nudgeStepMedium: number;
    static nudgeStepLarge: number;
    componentRef: React.RefObject<HTMLDivElement>;
    cropSelectRef: React.RefObject<HTMLDivElement>;
    resizeObserver?: ResizeObserver;
    mouseDownOnCrop: boolean;
    dragStarted: boolean;
    keysDown: Set<unknown>;
    evData: EvData;
    state: CropState;
    componentDidMount(): void;
    componentWillUnmount(): void;
    bindDocMove(): void;
    unbindDocMove(): void;
    onCropPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
    onComponentPointerDown: (e: React.PointerEvent) => void;
    onDocPointerMove: (e: PointerEvent) => void;
    onComponentKeyDown: (e: React.KeyboardEvent) => void;
    onComponentKeyUp: (e: React.KeyboardEvent) => void;
    onDocPointerDone: (e: PointerEvent) => void;
    getCropStyle(): {
        top: string;
        left: string;
        width: string;
        height: string;
    };
    getNewSize(): {
        width: number;
        height: number;
    };
    dragCrop(): CropObject;
    resizeCrop(): CropObject;
    createCropSelection(): JSX.Element;
    makeNewCrop(unit?: CropUnit): CropObject;
    crossOverCheck(evData: EvData): void;
    render(): JSX.Element;
}
export {};
