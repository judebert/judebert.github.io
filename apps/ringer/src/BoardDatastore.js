import ShuffleIcon from '@mui/icons-material/Shuffle';

// The BoardDatastore component provides info, titles, and more for all boards.
class BoardDatastore {

    zeroBoardInfo = {
        title: 'Playground',
        info: <div><div>Create Ringer art and challenges!</div><div>Playground boards are not included in statistics.</div></div>,
    };

    getTutorialOptions = () => 
        this.tutorials
            .map((json, index) => <option value={-index} key={-index}>{json.title}</option>)
            .slice(1); // Remove the placeholder

    getBoardInfo = (boardNum) => {
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
        let index = -boardNum;
        if (index >= this.tutorials.length) {
            return {
                title: "You Got Another Ring Comin'",
                info: <div>You've finished the tutorial, but there's a lot more Ringer to do! Use this blank board to practice or experiment. Or try one of the <em>millions</em> of boards in the <ShuffleIcon/> shuffle tab!</div>,
                data: "3000000000000000000000000000000000000000000000000000",
            };
        }
        return this.tutorials[index];
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

    tutorials = [
        {
            title: 'Placeholder',
            size: 9,
            depth: 2,
            info: <div>Board 0 is a blank board for building challenges or art. You should be unaable to get to it from the tutorials. It's just here to hold the space in the array.</div>,
            data: "3000000000000000000000000000000000000000000000000000",
        },
        {
            title: 'Rings',
            size: 9,
            depth: 2,
            info: <div>Like Minesweeper, each tile indicates how many flipped tiles it's next to. Ringer uses shapes or colors instead of numbers. Click the centers of the rings, in any order, to solve this board.</div>,
            data: "3000000080000000000000000004000000000000080000000000",
        },
        {
            title: 'Rings on Rings',
            size: 9,
            depth: 2,
            info: <div>If a ring would flip a tile that's off any edge, it "wraps around" and flips the tiles on the opposite edge. The board is also a ring! (Ringer "unwraps" it so you can see it on your flat screen.)</div>,
            data: "3004000000000000000000010000000000000000000000000G00",
        },
        {
            title: 'Ringing All the Way',
            size: 9,
            depth: 2,
            info: <div>A ring in a corner wraps around multiple edges! This board is a single ring in the top-left corner. Take a moment to understand why it looks this way.</div>,
            data: "3080000000000000000000000000000000000000000000000000",
        },
        {
            title: 'Overlapping',
            size: 9,
            depth: 2,
            info: <div>When rings are close enough, they may flip a tile back to blank! In this board, fixing the rings in the corners will expose the ring in the center.</div>,
            data: "3000000000000080200000000080000000010080000000000000",
        },
        {
            title: 'Corner Case',
            size: 9,
            depth: 2,
            info: <div>When wrapping and multiple depths collide, things can get complicated! On this board, two diagonal corners have been flipped. Which ones?</div>,
            data: "3080000000000000000000000000000000000000000000000080",
        },
        {
            title: 'The Ayes Have It',
            size: 9,
            depth: 2,
            info: <div>If you click two cells in a row, you get an <span class="code">I</span> shape. Here we have a vertical <span class="code">I</span>, a horizontal <span class="code">I</span>, and an <span class="code">I</span> that wraps around an edge. This is a common shape in shuffled boards.</div>,
            data: "3000000080000200000004G00000000000000000G00010000000",
        },
        {
            title: 'Diagonally',
            size: 9,
            depth: 2,
            info: <div>Another common Ringer shape is the <span class="code">Diagonal</span>. Here we have <span class="code">Diagonals</span> "rising" like a slash, "falling" like a backslash, and wrapping around an edge.</div>,
            data: "3000000010080200080000000000000000000004G00000000000",
        },
        {
            title: 'Clamshell',
            size: 9,
            depth: 2,
            info: <div>The <span class="code">Clamshell</span> appears when you flip tiles that are two spaces apart. They erase their common edge. This can be the cause of "incomplete" rings, like the one in bottom-right. Minecraft fans call them "Shulkers".</div>,
            data: "3000000080000000000G04200000000000000000G00080000000",
        },
        {
            title: `The Long Way 'Round`,
            size: 9,
            depth: 2,
            info: <div>This <span class="code">I</span> and <span class="code">Clamshell</span> wrap around their long edges.</div>,
            data: "3000J00000000000000000000000200000000004000000000000",
        },
        {
            title: `The Chevron`,
            size: 9,
            depth: 2,
            info: <div><span class="code">Chevrons</span> are built by flipping all but one corner of a 2x2 square. They can point in 4 different directions! Depending on the order you flip them, they can turn into an <span class="code">I</span> or a <span class="code">Diagonal</span>.</div>,
            data: "3000000010000280200000J00000000000080000J00000000000",
        },
        {
            title: "Cheshire Chevron",
            size: 9,
            depth: 2,
            info: <div>An isolated dot may show that a <span class="code">Chevron</span> has been erased. The trick is figuring out which way it pointed. Here, two rings hide the edges of the <span class="code">Chevron</span>. On random boards, the overlap isn't always so clean.</div>,
            data: "3000000000000000G00000000010004280000000000000000000",
        },
        {
            title: `Missing Tile`,
            size: 9,
            depth: 2,
            info: <div>These two <span class="code">Chevrons</span> overlap at their point, erasing it. Both isolated dots and missing dots may belong to partially erased <span class="code">Chevrons</span>.</div> ,
            data: "3000000000000010000280000000000090000200000000000000",
        },
        {
            title: `Eyeliners`,
            size: 9,
            depth: 2,
            info: <div>At the top of the screen, you see an <span class="code">I</span> that's 5 tiles long. The bottom <span class="code">I</span> is the same, but skips its middle tile. The top <span class="code">I-line</span> erases its center dots, but gains "borders". How far could you extend them?</div>,
            data: "3000000000000094J00000000000000000014280000000000000",
        },
        {
            title: `Long Eyeliners`,
            size: 9,
            depth: 2,
            info: <div>The top <span class="code">I-liner</span> goes all the way across the the screen. The bottom one is only possible on boards that are a multiple of 3, like 6x6 or 9x9. Since the boards are square, they may appear vertically, too.</div>,
            data: "3000000000000J94J90000000000000000214284000000000000",
        },
        {
            title: 'Caterpillar Tracks',
            size: 6,
            depth: 2,
            info: <div>We know from <span class='code'>Clamshells</span> that we can erase an entire side of a ring by flipping its opposite side. Because the <span class='code'>Caterpillar Tracks</span> rely on wrapping to erase the last edge, this pattern can only appear on even-size boards, like this 6x6.</div>,
            data: "2800000000G8400000000000",
        },
        {
            title: 'The Splat',
            size: 6,
            depth: 2,
            info: <div>The <span class="code">Splat</span> is an uncommon pattern formed by flipping four tiles that touch in a square. You could consider it two side-by-side <span class="code">Is</span>, or two <span class="code">Diagonals</span> on top of each other.</div>,
            data: "280000000028009000000000",
        },
        {
            title: 'The Square',
            credit: 'Melissa',
            size: 7,
            depth: 2,
            info: <div>If you flip the four tiles that are above, below, and to the sides of a center tile, you get this <span class="code">Square</span>. Depending on how you solve it, you may see crossing <span class="code">Clamshells</span> or overlapping <span class="code">Diagonals</span>.</div>,
            data: "2G00000000004000G800100000000000",
        },
        {
            title: 'Hip to be Square',
            credit: 'Melissa',
            size: 6,
            depth: 2,
            info: <div>Patterns and edges can have interesting effects. This is a <span class="code">Square</span> wrapped around two edges.</div>,
            data: "280020021001000000000000",
        },
        {
            title: 'Back-to-back',
            size: 9,
            depth: 2,
            info: <div>These two back-to-back <span class="code">Chevrons</span> erase interesting bits of each other.</div>,
            data: "3000000000000000000090000210000280000000000000000000",
        },
        {
            title: "Side by Side",
            size: 9,
            depth: 2,
            info: <div>These side-by-side <span class="code">Chevrons</span> erase their common center edge.</div>,
            data: "3000000000000090J00200G00000000000000000000000000000",
        },
        {
            title: `Outward Chevrons`,
            size: 9,
            depth: 2,
            info: <div>Use <span class="code">Chevrons</span> to erase the dots in the outside square. Because of the way they overlap in the center, we get this interesting pattern.</div>,
            data: "3000000000000090J00200G00000004010014280000000000000",
        },
        {
            title: `Four Corners`,
            size: 9,
            depth: 2,
            info: <div>Not every isolated dot is a <span class="code">Chevron</span>! This pattern was formed by flipping the tile in each corner.</div>,
            data: "3080000G00000000000000000000000000000000000004000080",
        },
        {
            title: `Four By Four`,
            size: 9,
            depth: 2,
            info: <div>We used <span class="code">Chevrons</span> to erase the inside dots from the <span class="code">Four Corners</span> pattern. If you flip each corner tile, you'll see the <span class="code">Outward Chevrons</span> tutorial board.</div>,
            data: "3080000G00000090J00200G00000004010014280000004000080",
        },
        {
            title: "Inversion",
            size: 5,
            depth: 2,
            info: <div><em>24 moves?</em>This is clearly one ring! We clicked every square on the board <em>except</em> the center one. Ringer is smart enough to know the board is solved if you click just the center.</div>,
            data: "2094J94J90J94J94J0",
        },
        {
            title: "Inversion 2",
            size: 5,
            depth: 2,
            info: <div>We made this board by clicking in a checkboard pattern on the entire board. You can solve it like a <span class="code">Square</span> in 4 moves.</div>,
            data: "2084210G84210G8420",
        },
        {
            title: "That's Deep",
            size: 9,
            depth: 3,
            info: <div>Here we've set the "depth" 3. Instead of flipping between black and white, Ringer flips to black, then grey, then white. (Ringer supports up to depth 5.) You can find our favorite patterns on this board.</div>,
            data: "3200000090080000080000000000010G00000000000000000000",
        },
        {
            title: "Inversion?",
            size: 8,
            depth: 2,
            info: <div>It's tempting to think of the two tiles in the center of this board as inverted rings. But flipping them won't change the outside edge or the rest of the board. Start with the corners that look like Diagonals instead.</div>,
            data: "2R00000000000G10000G0008000408000000000000",
        },
        {
            title: "Shortcut",
            credit: "Melissa",
            size: 8,
            depth: 2,
            info: <div>This 5x5 board has multiple solutions! Although it was created by flipping <em>four</em> tiles, it can be solved in three moves! Hints will show you the four-move solution; can you find the shortcut?</div>,
            data: "200420400000001000",
        },
        {
            title: "Bug",
            credit: "Melissa",
            size: 6,
            depth: 2,
            info: <div>"6+4" boards (6x6 boards with 4 shuffles, like this one) are the preferred format for puzzle-solvers. This one doesn't wrap, making it easier to solve. </div>,
            data: "280000421008000000000000",
        },
        {
            title: "Three Stripes",
            credit: "Melissa",
            size:6,
            depth: 2,
            info: <div>Here's a challenge! You can use the "Hint?" button to show either your missing moves (no cost), or a single productive move (costs 1 move). What's your best first-time score?</div>,
            data: "2800004210G8400000000000",
        },
        {
            title: `Puppy!`,
            size: 9,
            depth: 2,
            info: <div>Here we see Diagonals making up the puppy's ears and eyes. The chin and nose are likely a ring, too. If you flip those, you'll be left with a Clamshell.</div>,
            data: "3000000000000080200084000000000G80000000004000000000",
        },
    ];
}

export default BoardDatastore;
