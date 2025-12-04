// Utility types for clarity
export type ScalingMethod = 'linear' | 'log' | 'none';

/**
 * MarkerScaler manages the bounds and configuration for scaling numerical data 
 * to visual properties (radius and color) using Min-Max normalization.
 * * It computes the scaled min/max once upon creation and reuses them for 
 * subsequent calculations.
 */
export class MarkerScaler {
    private dataMin: number;
    private dataMax: number;
    private scalingMethod: ScalingMethod;
    private logBase: number;
    private minRadiusPx: number;
    private maxRadiusPx: number;

    /**
     * Initializes the MarkerScaler by computing the scaled minimum and maximum 
     * bounds of the entire dataset based on the configuration.
     * * @param fullDataset The entire array of raw numerical values (e.g., all daily volumes).
     * @param scalingMethod 'linear', 'log', or 'none'.
     * @param logBase Base for logarithmic scaling if 'log' method is chosen.
     * @param minRadiusPx The smallest acceptable radius in pixels (default 4).
     * @param maxRadiusPx The largest acceptable radius in pixels (default 40).
     */
    constructor(
        fullDataset: number[],
        scalingMethod: ScalingMethod = 'linear',
        logBase: number = 10,
        minRadiusPx: number = 4,
        maxRadiusPx: number = 40
    ) {
        this.scalingMethod = scalingMethod;
        this.logBase = logBase;
        this.minRadiusPx = minRadiusPx;
        this.maxRadiusPx = maxRadiusPx;

        // Compute scaled bounds immediately upon creation
        [this.dataMin, this.dataMax] = MarkerScaler.computeScalingBounds(
            fullDataset,
            this.scalingMethod,
            this.logBase
        );
    }

    // --------------------------------------------------------------------------
    // STATIC UTILITIES (Pure functions that don't need class state)
    // --------------------------------------------------------------------------

    /**
     * Applies the specified mathematical transformation (or none) to a value or an array.
     */
    private static _applyScalingMethod(
        value: number | number[], 
        scalingMethod: ScalingMethod, 
        logBase: number
    ): number | number[] {
        
        // Check if value is an array and recursively call for each item
        if (Array.isArray(value)) {
            return value.map(v => MarkerScaler._applyScalingMethod(v, scalingMethod, logBase) as number);
        }

        // Handle single number value
        const v = value;
        
        if (scalingMethod === 'log') {
            // Logarithmic scaling with a custom base (e.g., base 10)
            const baseLog = Math.log(logBase);
            // v + 1 handles zero or negative values.
            return Math.log(v + 1) / baseLog;
        }
        
        // 'linear' or 'none' scaling: return the value as is.
        // The raw value is then used in the Min-Max normalization step.
        return v;
    }

    /**
     * Computes the minimum and maximum of the SCALED data set. 
     * This is the underlying logic used by the constructor.
     */
    public static computeScalingBounds(
        data: number[],
        scalingMethod: ScalingMethod,
        logBase: number
    ): [number, number] {
        
        // 1. Handle empty data array
        if (data.length === 0) {
            return [0, 0];
        }

        // 2. Apply the initial scaling (if log is chosen, otherwise data is returned raw)
        const dataScaled = MarkerScaler._applyScalingMethod(data, scalingMethod, logBase) as number[];
        
        // 3. Compute the min and max of the SCALED data
        const dataMin = Math.min(...dataScaled);
        const dataMax = Math.max(...dataScaled);
        
        return [dataMin, dataMax];
    }


    // --------------------------------------------------------------------------
    // INSTANCE METHODS (Use internal state)
    // --------------------------------------------------------------------------

    /**
     * Calculates the pixel radius for a single data point using the pre-computed bounds.
     *
     * @param value The single numerical data point to scale.
     * @returns A single scaled radius value in pixels.
     */
    public getRadius(value: number): number {
        // 1. Handle the truly 'none' (raw value) scaling first.
        if (this.scalingMethod === 'none') {
            // The raw value is used directly as the radius.
            // minRadiusPx acts as a floor to prevent tiny or negative radii.
            return Math.max(this.minRadiusPx, value);
        }
        // 2. For 'linear' and 'log', proceed with normalization
        // Apply the same initial scaling to the single value
        const scaledValue = MarkerScaler._applyScalingMethod(
            value, 
            this.scalingMethod, 
            this.logBase
        ) as number;
        const dataRange = this.dataMax - this.dataMin;
        // 3. Handle Edge Case: All data points were identical (dataRange == 0)
        if (dataRange === 0) {
            return this.minRadiusPx;
        }
        // 4. Perform Min-Max Normalization (maps scaledValue to 0-1 range)
        let normalizedValue = (scaledValue - this.dataMin) / dataRange;
        // 5. Clamp the normalized value between 0 and 1
        normalizedValue = Math.max(0.0, Math.min(1.0, normalizedValue));
        // 6. Map Normalized Value to Target Pixel Range
        const targetRange = this.maxRadiusPx - this.minRadiusPx;
        // New Radius = Min_Radius + (Normalized_Value * Target_Range)
        const radius = this.minRadiusPx + (normalizedValue * targetRange);
        return radius;
    }

    /**
     * Calculates a Red-Yellow-Green (RYG) color string based on a value's position 
     * using the pre-computed scaled bounds.
     *
     * @param value The single numerical data point to color.
     * @returns An RGB color string (e.g., "rgb(255, 128, 0)").
     */
    public getColorRYG(value: number): string {
        
        // 1. Apply the same initial scaling to the single value
        const scaledValue = MarkerScaler._applyScalingMethod(
            value, 
            this.scalingMethod, 
            this.logBase
        ) as number;

        const dataRange = this.dataMax - this.dataMin;
        
        // Handle Edge Case: All data points were identical or range is zero
        if (dataRange === 0) {
            // Return a neutral color (Yellow)
            return "rgb(255,255,0)";
        }

        // 2. Perform Min-Max Normalization (maps scaledValue to 0-1 range)
        let t = (scaledValue - this.dataMin) / dataRange;
        
        // Clamp the normalized value between 0 and 1
        t = Math.max(0.0, Math.min(1.0, t));

        // 3. Map t (0-1) to Red (0) -> Yellow (0.5) -> Green (1)
        
        if (t < 0.5) {
            // Red to Yellow: Green ramps up from 0 to 255
            const k = t / 0.5;
            // R: 255, G: 255 * k, B: 0
            return `rgb(255, ${Math.round(255 * k)}, 0)`;
        } else {
            // Yellow to Green: Red ramps down from 255 to 0
            const k = (t - 0.5) / 0.5;
            // R: 255 * (1 - k), G: 255, B: 0
            return `rgb(${Math.round(255 * (1 - k))}, 255, 0)`;
        }
    }
}
