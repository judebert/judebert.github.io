import './App.css';
import React from 'react';
import Ringer from './Ringer.js';
import Board from './Board.js';
import BoardPrefs from './BoardPrefs.js';
import Tabs from './Tabs.js';
import ScoreBoard from './ScoreBoard.js';
import Dialog from './Dialog.js';
import seedrandom from 'seedrandom';

class App extends React.Component {
    constructor(props) {
        super(props);

        this.boardTimer = null;
        this.animTimer = null;

        let rng = seedrandom();
        let boardNum = Math.max(rng.int32() & 0x00FFFFFF, 1);
        rng = seedrandom(boardNum);
        let initSize = 9;
        let initDepth = 2;
        let initShuffles = 8;
        let ringer = new Ringer(initSize, initDepth);
        let goal = 0;
        this.state = {
            ringer: ringer,
            rng: rng,
            boardNum: boardNum,
            size: initSize,
            history: [],
            goal: goal,
            step: 0,
            moves: 0,
            elapsed: 0,
            prevTime: window.performance.now(),
            icons: 'ringer-monochrome',
            hints: [],
            solved: true,
            showDialog: false,
            frame: 0,
            next: {
                size: initSize,
                icons: 'ringer-monochrome',
                depth: initDepth,
                shuffles: initShuffles,
                boardNum: boardNum + 1,
            },
        };
    }

    componentDidMount() {
        this.newGame();
    }

    newGame() {
        if (this.animTimer) {
            clearInterval(this.animTimer);
        }
        if (this.boardTimer) {
            clearInterval(this.boardTimer);
        }
        let next = Object.assign({},  this.state.next);
        let ringer = new Ringer(next.size, next.depth);
        let boardNum = Math.max(0, parseInt(next.boardNum));
        if (!isNaN(next.shuffles) && next.shuffles > 0) {
            ringer.shuffle(boardNum, next.shuffles);
        }
        // Still a *minute* chance that the shuffle could create a solved multi-depth board, I guess. 
        let solved = ringer.isSolvedBy([]);
        if (!solved) {
            this.boardTimer = setInterval(() => this.handleSolveTimer(), 500);
        }
        next.boardNum++;
        this.setState({
            ringer: ringer,
            boardNum: boardNum,
            size: next.size,
            icons: next.icons,
            depth: next.depth,
            history: [],
            goal: ringer.goal,
            step: 0,
            moves: 0,
            elapsed: 0,
            prevTime: window.performance.now(),
            hints: [],
            solved: solved,
            showDialog: false,
            frame: 0,
            next: next,
        });
    }

    handleSolveTimer() {
        let now = window.performance.now();
        let subElapsed = now - this.state.prevTime;
        this.setState({
            elapsed: this.state.elapsed + subElapsed,
            prevTime: now
        });
    }

    handlePrefChange(prefs) {
        this.setState({
            next: prefs,
        });
    }

    handleHints() {
        let history = this.state.history;
        let size = this.state.ringer.size;
        // What still needs to be clicked?
        let clicked = this.state.ringer.bestSolution(history);
        let mistakes = history.map((move) => this.state.ringer._asIndex(move)).filter((index) => clicked[index] !== 0);
        let misses = clicked.map((distance, index) => index).filter((index) => clicked[index] !== 0);
        let hintIndexes = mistakes.length > 0 ? mistakes :
            misses.length > 0 ? misses.slice(0, 1) : [];
        console.warn('Best solution:');
        console.dir(clicked);
        console.warn('History:');
        console.dir(history);
        console.warn('Mistakes:');
        console.dir(mistakes);
        console.warn('Misses:');
        console.dir(misses);
        console.log('hintIndexes:');
        console.dir(hintIndexes);
        // Board is expecting a depth map, so we can make pretty indicators (some day)
        let hints = new Array(size * size).fill(0);
        hintIndexes.forEach((index) => hints[index] = clicked[index]);
        this.setState({
            hints: hints,
            moves: this.state.moves + (mistakes.length > 0 ? 0 : 1),
        });
    }

    handleReset(resetTimer) {
        clearInterval(this.boardTimer);
        this.boardTimer = setInterval(() => this.handleSolveTimer(), 500);
        this.setState({
            step: 0,
            moves: 0,
            history: [],
            hints: [],
            elapsed: 0,
            prevTime: window.performance.now(),
            showDialog: false,
        });
    }

    handleDismissDialog() {
        this.setState({
            showDialog: false,
        });
    }

    makeMove(x, y) {
        let moves = this.state.moves + 1;
        let step = this.state.step;
        let history = this.state.history.slice(0, step).concat([[x, y]]);
        let solved = this.state.ringer.isSolvedBy(history);
        let showDialog = this.state.showDialog;
        if (solved) {
            clearInterval(this.animTimer);
            clearInterval(this.boardTimer);
            this.animTimer = setInterval(() => this.animate(), 150);
            showDialog = true;
        }
        let index = this.state.ringer._asIndex([x, y]);
        let hints = this.state.hints.slice();
        if (hints && hints.length > index && hints[index] > 0) {
            let depth = this.state.depth;
            hints[index] = (hints[index] + depth + 1) % depth;
        }
        this.setState({
            history: history,
            step: step + 1,
            moves: moves,
            solved: solved,
            showDialog: showDialog,
            hints: hints,
            frame: 0,
        });
    }

    handleUndo() {
        console.log(`Undo from ${this.state.step}/${this.state.history.length}`);
        this.setState({
            step: this.state.step - 1,
        });
    }

    handleRedo() {
        console.log(`Redo to ${this.state.step + 1}/${this.state.history.length}`);
        this.setState({
            step: this.state.step + 1,
        });
    }

    animate() {
        this.setState({
            frame: this.state.frame + 1,
        });
    }

    render() {
        let size = this.state.size;
        let step = this.state.step;
        let canUndo = step > 0;
        let history = this.state.history.slice(0, step);
        let canRedo = step < this.state.history.length;
        let past = this.orderFrom(history, size, 'forward');
        let future = this.orderFrom(this.state.history.slice(step), size, 'reverse');
        let solved = this.state.solved;
        let hints = this.state.hints;
        let showDialog = this.state.showDialog;
        let dialogButtons = Array.of(
          <button className="Retry" key="retry" onClick={() => this.handleReset()}>Try Again</button>,
          <button className="NewBoard" key="new" onClick={() => this.newGame()}>Next Puzzle</button>,
          <button className="Dismiss" key="home" onClick={() => this.handleDismissDialog()}>Home</button>
        );
        return (
            <div className="App">
              <header className="App-header">
                <h1>Ringer</h1>
                <aside>{process.env.REACT_APP_VERSION}</aside>
                <Tabs name="options">
                  <div label="Info" id="info-tab">
                    Tap any cell to flip the ring of cells around it.
                    The whole board is a ring, too: flipping a cell outside an edge flips the cell on the opposite edge!
                    Can you get all the cells to match?
                  </div>
                  <div label="Options" id="option-tab">
                    <BoardPrefs
                      prefs={this.state.next}
                      onPrefChange={this.handlePrefChange.bind(this)}>
                    </BoardPrefs>
                    <div className="BoardButtons">
                      <button className="NewBoard"
                        onClick={() => this.newGame()}>Shuffle!</button>
                    </div>
                  </div>
                </Tabs>
                <div className="solving-buttons">
                  <button className="Undo" onClick={() => this.handleUndo()} disabled={!canUndo}>
                      Undo
                  </button>
                  <button className="Redo" onClick={() => this.handleRedo()} disabled={!canRedo}>
                      Redo
                  </button>
                  <button className="Hints" onClick={() => this.handleHints()} disabled={solved}>
                      Hint?
                  </button>
                  <button className="Reset" onClick={() => this.handleReset()}>Reset</button>
                </div>
                <ScoreBoard
                    moves={this.state.moves}
                    goal={this.state.goal}
                    elapsed={this.state.elapsed}
                    solved={solved}
                    boardNum={this.state.boardNum}
                />
              </header>
              <section className="App-content">
                <Board board={this.state.ringer}
                  moves={this.state.history}
                  step={step}
                  icons={this.state.icons}
                  hints={solved ? [] : hints}
                  past={solved ? [] : past}
                  future={solved ? [] : future}
                  onClick={(x, y) => this.makeMove(x, y)}
                />
              </section>
              <Dialog active={showDialog} buttons={dialogButtons}>
                <ScoreBoard
                    moves={this.state.moves}
                    goal={this.state.goal}
                    elapsed={this.state.elapsed}
                    solved={solved}
                    boardNum={this.state.boardNum}
                />
                <div>Game stats go here: moves, time, streaks...</div>
              </Dialog>
            </div>
        );
    };

    // TODO: Pull these into a BoardLogic class or something
    // They're not UI, they're logic.
    //

    // Returns a map of cells (by index) to their most recent click in the `moves`.
    // Early clicks are overwritten by later ones, unless `reverse` is set to `'reverse'`,
    // in which case later clicks are overwritten by earlier ones.
    // Essentially, tells you that "the user clicked the cell at (3, 2) on their 3rd move".
    // TODO: *Why* do I need this? TWO WAYS?
    orderFrom(moves, size, reverse) {
        let order = new Array(size * size).fill(0);
        for (var i = 0; i < moves.length; i++) {
            let [x, y] = moves[i];
            let index = y * size + x;
            order[index] = reverse === 'reverse' ? i + 1 : moves.length - i; 
        }
        return order;
    }

    animatedGrid(frame, size, depth) {
        // TODO: choose or pass an animation
        let display;
        frame = frame % (size * 4);
        let stage = Math.floor(frame / (size * 2));
        switch (stage) {
            default:
            case 0: 
                // Stage 0: SE fill
                frame = frame % (size * 2);
                display = new Array(size * size).fill(0);
                for (let y = 0; y <= frame && y < size; y++) {
                    for (let x = 0; x <= (frame - y) && x < size; x++) {
                        let index = y * size + x;
                        display[index] = 1;
                    }
                }
                break;
            case 1:
                // Stage 1: SE clear
                frame = frame % (size * 2);
                display = new Array(size * size).fill(1);
                for (let y = 0; y <= frame && y < size; y++) {
                    for (let x = 0; x <= (frame - y) && x < size; x++) {
                        let index = y * size + x;
                        display[index] = 0;
                    }
                }
                break;
        }
        return display;
    }
}

export default App;
