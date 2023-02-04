
class BitPacker {

    // Shared
    buffer = [];
    width = 8;

    // Packing
    space = 0;

    // Unpacking
    remain = 0;
    progress = -1;

    // How the bitpacking works
    // 
    // Assume width is 8.
    //
    // Case: 5 space, pack 3 (current is like 0b111-----, val is 0b--111)
    //    Taken: 3 (min(5, 3) => 3)
    //    Mask: 0b0111 (1 << 3 => 0b1000 - 1 => 0b0111, no leftshift)
    //    Shift: 2 (space - numBits => 5 - 3 => 2)
    //    Shifted value: 0b11100
    //    Or result: 0b11111100
    //    Bits remaining: 0 (numBits - taken => 3 - 3 => 0)
    //    Space remaining: 2 (space - taken => 5 - 3 => 2, same as shift because space >= numBits)
    // Case: 8 space, pack 1 (current is like 0b--------, val is 0b-1)
    //    Taken: 1 (min(8, 1) => 1)
    //    Mask: 0b01 (1 << 1 => 0b10 - 1 => 0b01, no leftshift)
    //    Shift: 7 (space - numBits => 8 - 1 => 7)
    //    Shifted value: 0b10000000
    //    Or result: 0b10000000
    //    Bits remaining: 0 (numBits - taken => 1 - 1 => 0)
    //    Space remaining: 7 (space - taken => 8 - 1 => 7)
    // Case: 2 space, pack 5 (current is like 0b111111--, val is 0b---11111)
    //    Taken: 2 (min(2, 5) => 2)
    //    Mask: 0b00011000 (1 << 2 => 0b100 - 1 => 0b011 << (5 - 2) => 0b011000)
    //    Shift: -3 (space - numBits => 2 - 5 => -3)
    //    Shifted value: 0b011
    //    Or result: 0b11111111
    //    Bits remaining: 3 (numBits - taken => 5 - 2 => 3; loop up to take care of these)
    //    Space remaining: 0 (space - taken => 2 - 2 => 0)
    //
    // The original code had a bug that did not consider the case where space === numbits.
    // Really, the problem was shorcut / combined code that did single-line shifting and OR.
    // The conditional correctly determined no shift was needed, but then erroneously also skipped the OR. 
    // Changing > to >= fixed it.

    // Packs the least significant `numBits` of `val` into the bitpack
    pack(numBits, val) {
        while (numBits > 0) {
            // Should I add another byte?
            if (this.space === 0) {
                this.space = this.width;
                this.buffer.push(0);
            } 
            let current = this.buffer.pop();
            const taken = Math.min(this.space, numBits);
            // Grab the bits in question
            // TODO: Find a way to make this work full word width (at 32, it would break)
            let mask = (1 << taken) - 1;
            if (numBits > this.space) {
                mask <<= (numBits - this.space);
            }
            const bits = val & mask;
            // Shift them to the left edge of the remaining space
            const shift = this.space - numBits;
            if (shift >= 0) {
                current = current | (bits << shift);
            } else if (shift < 0) {
                current = current | (bits >>> -shift);
            }
            // Adjust bits remaining
            numBits -= taken;
            // Adjust space remaining
            this.space -= taken;
            // Replace the packed value
            this.buffer.push(current);
        }
    }

    // How unpacking works (much simpler than packing)
    //
    // 1. Find the number of bits we can take: Math.min(numBits, remain)
    // 2. Find how far left in the source to shift (remain - taken)
    // 3. Build the mask and shift it over ((1 << taken) - 1) << fromShift
    // 4. Pull that value from the source, and shift it *back* so it's in the least significant digits
    // 5. Find how far left to shift in the destination (numBits - taken)
    // 6. OR that value into the result
    // 7. Adjust remaining and desired bit, and repeat the whole thing

    reset(data) {
        if (data === undefined) {
            data = [];
        }
        this.buffer = data;
        this.space = 8;
        this.progress = -1;
        this.remain = 0;
    }
    
    // Unpacks the next `numBits` from the buffer as the least significant bits of the return
    unpack(numBits) {
        if (this.buffer === undefined || this.buffer.length < 1) {
            throw new Error(`Can't unpack from nothnig!`);
        }
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

    toUint8Array(ringer, moves) {
        // Okay, we'll need:
        // * 3 bits: a size (5 - 12 maps to 0 - 7, which fits in 3 bits)
        // * a depth (2 - 5 maps to 0 - 3, which fits in 2 bits)
        // We'll also need a representation of the moves. Either:
        // * size^2 depth values (0 to depth - 1, max 0 - 4, needs 3 bits)
        // or:
        // * variable list of index-clicks (up to size^2 * depth / 2 clicks, each 0 - 143, needing 8 bits each)
        // It'll be easiest to restrict length if the length is known, so I'm going with the depth map.
        // We don't need: 
        // * a goal (can be computed from depth values)
        //
        // We could RLE the depths. That isn't guaranteed.
        // We could restrict bits by depth (depth 2 needs 1 bit / depth, 3 and 4 need 2, 5 needs 3)
        // For now, we'll use plain values. We'll prepend a format identifier; say 4 bits?
        //
        // Total bit length after packing: 9 + (3 * size^2).
        // 9x9 => 9 + (3 * 81) => 9 + 243 => 252, / 8 = 31.5 bytes
        //
        // Fail:
        //   #CF1635 at start[3] = 28
        //   #94C76B at start[4] = 44 and start[7] = 76
        //   #94C76C at start[4] = 44 and start[7] = 76
        //   #F9E9D9 at start[0] = 12 and start[6] = 60
        // Succeed:
        //   #94C76A (max byte value 72)
        //
        // Case: 3 space, pack 3 (current is like 0b11111---, val is 0b-----111 - specifically, 0b001)
        //    Taken: 3 (min(3, 3) => 3)
        //    Mask: 0b000111 (1 << 3 => 0b1000 - 1 => 0b0111, no leftshift)
        //    Shift: 0 (space - numBits => 3 - 3 => 0)
        //    Shifted value: 0b0111
        //    Or result: 0b11111111
        //    Bits remaining: 0 (numBits - taken => 3 - 3 => 0)
        //    Space remaining: 0 (space - taken => 3 - 3 => 0)
        this.pack(4, 1);
        this.pack(3, ringer.size - 5);
        this.pack(2, ringer.depth - 2);
        if (moves === undefined) {
            moves = [];
        }
        ringer.depthFrom(moves).forEach((depth, index) => this.pack(3, depth));
        return new Uint8Array(this.buffer);
    }
}

export default BitPacker;
