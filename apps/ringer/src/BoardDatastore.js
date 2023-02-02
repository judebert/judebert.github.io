import React from 'react';

// The BoardDatastore component provides info, titles, and more for all boards.
class BoardDatastore extends React.Component {

    zeroBoardInfo = {
        title: 'Playground',
        info: <div><div>Create Ringer art and challenges!</div><div>Playground boards are not included in statistics.</div></div>,
    };

    getTutorialOptions = () => 
        Array.from(this.tutorials)
            .map(([boardNum, json]) => <option value={boardNum} key={boardNum}>{json.title}</option>);

    getBoardInfo = (boardHex) => {
        let boardNum = parseInt(boardHex, 16);
        if (!boardNum) {
            return this.zeroBoardInfo;
        }
        if (boardNum < 0) {
            return this.getTutorialBoardInfo(boardNum);
        }
        if (boardNum > 0) {
            return this.getNamedBoardInfo(boardNum);
        }
    };

    getTutorialBoardInfo = (boardNum) => {
        if (!this.tutorials.has(boardNum)) {
            return {
                title: 'New Phone, Who Dis?',
                info: "You have somehow requested a tutorial board that does not exist. Here's a blank 9x9, and please tell us how you did this.",
                data: "3000000000000000000000000000000000000000000000000000",
            };
        }
        return this.tutorials.get(boardNum);
    };

    getNamedBoardInfo = (boardNum) => {
        if (!this.namedBoards.has(boardNum)) {
            return {
                info: <div>Tap any cell to flip the ring of cells around it.<br/>The whole board is a ring, too: flipping a cell outside an edge flips the cell on the opposite edge!<br/>Can you get all the cells to match?</div>,
            }
        }
        return this.namedBoards.get(boardNum);
    };

    namedBoards = new Map([
        [105, {
            title: 'Nice',
            info: ""
        }], 
        [1056, {
            title: 'Blaze It!',
            info: ""
        }], 
        [26985, {
            title: 'NiceNice',
            info: ""
        }], 
        [270441, {
            title: 'Danker than Nice',
            info: ""
        }], 
        [4327056, {
            title: 'Much Danker than Nice',
            info: ""
        }], 
        [6908265, {
            title: 'NiceNiceNice',
            info: ""
        }], 
    ]);

    tutorials = new Map([
        [-1, {
            title: 'Rings',
            size: 9,
            depth: 2,
            info: "Like Minesweeper, each tile indicates how many flipped tiles it's next to. Ringer uses shapes or colors instead of numbers. Click the centers of the rings, in any order, to solve this board.",
            data: "3000000080000000000000000004000000000000080000000000",
        }],
        [-2, {
            title: 'Rings on Rings',
            size: 9,
            depth: 2,
            info: `If a ring would flip a tile that's off any edge, it "wraps around" and flips the tiles on the opposite edge. The board is also a ring! (Ringer "unwraps" it so you can see it on your flat screen.)`,
            data: "3004000000000000000000010000000000000000000000000G00",
        }],
        [-3, {
            title: 'Ringing All the Way',
            size: 9,
            depth: 2,
            info: "A ring in a corner wraps around multiple edges! This board is a single ring in the top-left corner. Take a moment to understand why it looks this way.",
            data: "3080000000000000000000000000000000000000000000000000",
        }],
        [-4, {
            title: 'Overlapping',
            size: 9,
            depth: 2,
            info: "When rings are close enough, they may flip a tile back to blank! In this board, fixing the rings in the corners will expose the ring in the center.",
            data: "3000000000000080200000000080000000010080000000000000",
        }],
        [-5, {
            title: 'Corner Case',
            size: 9,
            depth: 2,
            info: "When wrapping and multiple depths collide, things can get complicated! On this board, two diagonal corners have been flipped. Which ones?",
            data: "3080000000000000000000000000000000000000000000000080",
        }],
        [-6, {
            title: 'The Ayes Have It',
            size: 9,
            depth: 2,
            info: `If you click two cells in a row, you get an "I" shape. Here we have a vertical I, a horizontal I, and an I that wraps around an edge. This is a common shape in shuffled boards.`,
            data: "3000000080000200000004G00000000000000000G00010000000",
        }],
        [-7, {
            title: 'Diagonally',
            size: 9,
            depth: 2,
            info: `Another common Ringer shape is the Diagonal. Here we have a diagonals "rising" like a slash, "falling" like a backslash, and one that wraps around an edge.`,
            data: "3000000010080200080000000000000000000004G00000000000",
        }],
        [-8, {
            title: 'Clamshell',
            size: 9,
            depth: 2,
            info: `The Clamshell appears when you flip tiles that are two spaces apart. They erase their common edge. This can be the cause of "incomplete" rings, like the one in bottom-right. Minecraft fans call them "Shulkers".`,
            data: "3000000080000000000G04200000000000000000G00080000000",
        }],
        [-9, {
            title: `The Long Way 'Round`,
            size: 9,
            depth: 2,
            info: `This 'I' and Clamshell wrap around their long edges.`,
            data: "3000J00000000000000000000000200000000004000000000000",
        }],
        [-10, {
            title: `The Chevron`,
            size: 9,
            depth: 2,
            info: `Chevrons are bChevrons are built by flipping all but one corner of a 2x2 square. They can point in 4 different directions! Depending on the order you flip them, they can turn into an I or a Diagonal.`,
            data: "3000000010000280200000J00000000000080000J00000000000",
        }],
        [-11, {
            title: `Eyeliners`,
            size: 9,
            depth: 2,
            info: `At the top of the screen, you see an I that's 5 tiles long. The bottom I is the same, but skips its middle tile. The top I-line erases its center dots, but gains "borders". How far could you extend them?`,
            data: "3000000000000094J00000000000000000014280000000000000",
        }],
        [-12, {
            title: `Long Eyeliners`,
            size: 9,
            depth: 2,
            info: `The top I-liner goes all the way across the the screen. The bottom one is only possible on boards that are a multiple of 3, like 6x6 or 9x9. Since the boards are square, they may appear vertically, too.`,
            data: "3000000000000J94J90000000000000000214284000000000000",
        }],
        [-13, {
            title: 'Caterpillar Tracks',
            size: 6,
            depth: 2,
            info: "We know from Clamshells that we can erase an entire side of a ring by flipping its opposite side. Because the Caterpillar Tracks rely on wrapping to erase the last edge, this pattern can only appear on even-size boards, like this 6x6.",
        }],
        [-14, {
            title: `Four Corners`,
            size: 9,
            depth: 2,
            info: `Hmm...`,
            data: "3080000G00000000000000000000000000000000000004000080",
        }],
        [-15, {
            title: `Four By Four`,
            size: 9,
            depth: 2,
            info: `We used Chevrons to erase the inside dots from the Four Corners pattern. Because of the way they overlap in the center, we get this interesting pattern.`,
            data: "3080000G00000090J00200G00000004010014280000004000080",
        }],
        [-16, {
            title: "Inversion",
            size: 5,
            depth: 2,
            info: <div><em>24 moves?</em>This is clearly one ring! We clicked every square on the board <em>except</em> the center one. Ringer is smart enough to know the board is solved if you click just the center.</div>,
            data: "2094J94J90J94J94J0",
        }],
        [-17, {
            title: "Inversion 2",
            size: 5,
            depth: 2,
            info: `We made this board by clicking in a checkboard pattern. You can solve it in 4 moves.`,
            data: "2084210G84210G8420",
        }],
        [-18, {
            title: "That's Deep",
            size: 9,
            depth: 3,
            info: `Here we've set the "depth" 3. Instead of flipping between black and white, Ringer flips to black, then grey, then white. (Ringer supports up to depth 5.) You can find our favorite patterns on this board.`,
            data: "3200000090080000080000000000010G00000000000000000000",
        }],
        [-19, {
            title: "Inversion?",
            size: 8,
            depth: 2,
            info: "It's tempting to think of the two tiles in the center of this board as inverted rings. But flipping them won't change the outside edge or the rest of the board. Start with the corners that look like Diagonals instead.",
            data: "2R00000000000G10000G0008000408000000000000",
        }],
        [-20, {
            title: `Puppy!`,
            size: 9,
            depth: 2,
            info: `Here we see Diagonals making up the puppy's ears and eyes. The chin and nose are likely a ring, too. If you flip those, you'll be left with a Clamshell.`,
            data: "3000000000000080200084000000000G80000000004000000000",
        }],
    ]);
}

export default BoardDatastore;
