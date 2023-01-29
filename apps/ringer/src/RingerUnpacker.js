import Ringer from './Ringer.js';

class RingerUnpacker {
    buffer = undefined;
    remain = 0;
    width = 8;
    progress = -1;

    // How unpacking works
    // 1. Find the number of bits we can take: Math.min(numBits, remain)
    // 2. Find how far left in the source to shift (remain - taken)
    // 3. Build the mask and shift it over ((1 << taken) - 1) << fromShift
    // 4. Pull that value from the source, and shift it *back* so it's in the least significant digits
    // 5. Find how far left to shift in the destination (numBits - taken)
    // 6. OR that value into the result
    // 7. Adjust remaining and desired bit, and repeat the whole thing
    
    constructor(packed) {
        if (packed === undefined || packed.length < 1) {
            throw new Error("No data in packed buffer!");
        }
        this.buffer = packed;
    }

    // Unpacks the next `numBits` from the buffer as the least significant bits of the return
    unpack(numBits) {
        if (numBits > this.width) {
            throw new Error(`Can't unpack more than ${this.width} bits!`);
        }
        let result = 0;
        while (numBits > 0) {
            // Should I pull the next byte?
            if (this.remain === 0) {
                this.remain = this.width;
                this.progress++;
            }
            // Pull a byte
            let current = this.buffer[this.progress];
            // How many bits can I take from this byte?
            const taken = Math.min(this.remain, numBits);
            // Grab the bits in question from the left edge of the available space
            // TODO: Find a way to make this work full word width (at 32, it would break because it returns 0)
            let fromMask = (1 << taken) - 1;
            const fromShift = this.remain - taken;
            fromMask <<= fromShift;
            const bits = (current & fromMask) >> fromShift;
            // Where in the result do they go?
            const toShift = numBits - taken;
            result |= (bits << toShift);
            // Adjust bits remaining
            numBits -= taken;
            // Adjust space remaining
            this.remain -= taken;
        }
        return result;
    }

    toRinger() {
        let version = this.unpack(4);
        if (version !== 1) {
            throw new Error(`Unknown save version ${version}`);
        }
        const size = this.unpack(3) + 5;
        const depth = this.unpack(2) + 2;
        const depths = [];
        for (let i = 0; i < size * size; i++) {
            const depth = this.unpack(3, i);
            depths.push(depth);
        }
        const start = depths.flatMap((cellDepth, index) => Array(cellDepth).fill(index));

        const ringer = new Ringer(size, depth);
        ringer.fromJson({
            boardNum: 0,
            size: size,
            depth: depth,
            goal: 0,
            start: start,
            info: 'loaded from RingerUnpacker',
        });
        return ringer;
    }
}

export default RingerUnpacker;
