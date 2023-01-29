import './App.css';
import React from 'react';
import Ringer from './Ringer.js';
import MoveHistory from './MoveHistory.js';
import SolveStats from './SolveStats.js';
import Persistence from './Persistence.js';
import Board from './Board.js';
import BoardPrefs from './BoardPrefs.js';
import Tabs from './Tabs.js';
import ScoreBoard from './ScoreBoard.js';
import HighScores from './HighScores.js';
import Dialog from './Dialog.js';
import Share from './Share.js';
import BitPacker from './BitPacker.js';
import seedrandom from 'seedrandom';
import toBase32 from 'base32-encode';
import fromBase32 from 'base32-decode';


class App extends React.Component {
    constructor(props) {
        super(props);

        this.boardTimer = null;
        this.animTimer = null;
        this.solveStats = null;
        this.highScores = null;
        this.persistence = new Persistence();
        this.dialogButtons = Array.of(
          <button className="Retry" key="retry" onClick={() => this.handleReset()}>Try Again</button>,
          <button className="NewBoard" key="new" onClick={() => this.newGame()}>Next Puzzle</button>,
          <button className="Dismiss" key="home" onClick={() => this.handleDismissDialog()}>Home</button>
        );

        // Initialize board number
        let initParams = this._initParams();
        let ringer = new Ringer(initParams.size, initParams.depth);
        this.state = {
            ringer: ringer,
            history: new MoveHistory(),
            moves: 0,
            elapsed: 0,
            prevTime: window.performance.now(),
            icons: 'ringer-monochrome',
            hints: [],
            solved: true,
            showDialog: false,
            frame: 0,
            next: {
                size: initParams.size,
                icons: 'ringer-monochrome',
                depth: initParams.depth,
                shuffles: initParams.shuffles,
                boardNum: initParams.boardNum,
            },
            optionTab: 'info-tab',
        };

        // "Auto"bind methods, so we don't update state in render() every time the clock updates
        this.urlUpdated = this.urlUpdated.bind(this);
        this.newGame = this.newGame.bind(this);
        this.handleOptionTabChange = this.handleOptionTabChange.bind(this);
        this.handleSolveTimer = this.handleSolveTimer.bind(this);
        this.handlePrefChange = this.handlePrefChange.bind(this);
        this.handleHints = this.handleHints.bind(this);
        this.handleReset = this.handleReset.bind(this);
        this.handleDismissDialog = this.handleDismissDialog.bind(this);
        this.makeMove = this.makeMove.bind(this);
        this.handleUndo = this.handleUndo.bind(this);
        this.handleRedo = this.handleRedo.bind(this);
        this._stopTimers = this._stopTimers.bind(this);
        this.saveBuffer = this.saveBuffer.bind(this);
        this.loadBuffer = this.loadBuffer.bind(this);
    }

    componentDidMount() {
        this.newGame();
        window.addEventListener('hashchange', this.urlUpdated);
    }

    urlUpdated(event) {
        let newInfo = this._initParams();
        if (newInfo.boardNum === this.state.ringer.boardNum) {
            return;
        }
        let merged = Object.assign({}, this.state.next, newInfo);
        this.setState(
            {
                next: merged,
            },
            this.newGame
        );
    }

    _initParams(data) {
        if (data === undefined) {
            data = window.location;
        }
        let boardNum = parseInt(data.hash.substring(1), 16);
        if (Number.isNaN(boardNum) || boardNum < 1 || boardNum > 0x00FFFFFF) {
            let rng = seedrandom();
            boardNum = Math.max(rng.int32() & 0x00FFFFFF, 1);
        }
        let initSize = 9;
        let initDepth = 2;
        let initShuffles = 8;
        let initData = {
            boardNum: boardNum,
            size: initSize,
            depth: initDepth,
            shuffles: initShuffles,
        };
        return initData;
    }

    _stopTimers() {
        if (this.animTimer) {
            clearInterval(this.animTimer);
        }
        if (this.boardTimer) {
            clearInterval(this.boardTimer);
        }
    }

    newGame() {
        this._stopTimers();
        let next = Object.assign({}, this.state.next);
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
        this.solveStats = new SolveStats({boardNum:ringer.boardNum, size:ringer.size, goal:ringer.goal});
        this.highScores = this.persistence.getIdenticalStats(this.solveStats);
        next.boardNum++;
        this.setState({
            ringer: ringer,
            icons: next.icons,
            history: new MoveHistory(),
            moves: 0,
            elapsed: 0,
            prevTime: window.performance.now(),
            hints: [],
            solved: solved,
            showDialog: false,
            frame: 0,
            next: next,
            optionTab: 'info-tab',
        });
    }

    saveBuffer() {
        const packer = new BitPacker();
        const buffer = packer.toUint8Array(this.state.ringer, this.state.history.current());
        navigator.clipboard.writeText(toBase32(buffer, 'Crockford', { padding: false }))
            .then((event) => alert('Saved board code to clipboard'))
            .catch((event) => alert('Could not save board code to clipboard!'));
    }

    loadBuffer() {
        const b32Text = document.getElementsByClassName('BoardCode')[0].value;
        const data = new Uint8Array(fromBase32(b32Text, 'Crockford'));
        const packer = new BitPacker();
        packer.reset(data);
        const ringer = packer.toRinger();
        ringer.goal = ringer.depthFrom([]).reduce((sum, cellDepth) => sum + ringer._clicksAway(cellDepth), 0);
        this.solveStats = new SolveStats({boardNum:ringer.boardNum, size:ringer.size, goal:ringer.goal});
        this._stopTimers();
        let history = new MoveHistory();
        this.setState({
            ringer: ringer,
            moves: 0,
            history: history,
            hints: [],
            elapsed: 0,
            prevTime: window.performance.now(),
            showDialog: false,
            solved: this.state.ringer.isSolvedBy(history.current()),
        });
    }

    handleOptionTabChange(toTab) {
        this.setState({
            optionTab: toTab,
        });
    };

    handleSolveTimer() {
        let now = window.performance.now();
        let subElapsed = now - this.state.prevTime;
        this.solveStats.setTime(this.state.elapsed + subElapsed);
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
        this.solveStats.addHint();
        let history = this.state.history;
        let size = this.state.ringer.size;
        // What still needs to be clicked?
        let clicked = this.state.ringer.bestSolution(history);
        let mistakes = history.current().filter((index) => clicked[index] !== 0);
        let misses = clicked.map((depth, index) => [depth, index])
            .filter(([depth, index]) => depth > 0)
            .map(([depth, index]) => index);
        let chosen = mistakes.length > 0 ? mistakes :
            misses.length > 0 ? [misses[0]] : [];
        // Convert to depth map for (eventual) pretty display
        let hints = new Array(size * size).fill(0);
        chosen.forEach((index) => hints[index] = clicked[index]);
        // Only costs a move if it reveals progress; no cost for revealing mistakes
        this.setState({
            hints: hints,
            moves: this.state.moves + (mistakes.length > 0 ? 0 : 1),
        });
    }

    handleReset() {
        this.solveStats.addReset();
        this._stopTimers();
        this.boardTimer = setInterval(() => this.handleSolveTimer(), 500);
        let history = new MoveHistory();
        this.setState({
            moves: 0,
            history: history,
            hints: [],
            elapsed: 0,
            prevTime: window.performance.now(),
            showDialog: false,
            solved: this.state.ringer.isSolvedBy(history.current()),
        });
    }

    handleDismissDialog() {
        this.setState({
            showDialog: false,
        });
    }

    makeMove(index) {
        let ringer = this.state.ringer;
        let moves = this.state.moves + 1;
        let history = this.state.history.makeMove(index);
        // Are we auto-starting a playground?
        if (this.state.solved) {
            ringer = new Ringer(ringer.size, ringer.depth);
            moves = 1;
            history = new MoveHistory().makeMove(index);
        }
        let solved = ringer.isSolvedBy(history.current());
        let showDialog = this.state.showDialog;
        if (solved) {
            clearInterval(this.animTimer);
            clearInterval(this.boardTimer);
            this.animTimer = setInterval(() => this.animate(), 150);
            showDialog = true;
            // The SolveStats can't track the moves, because they change cost on hints.
            this.solveStats.setMoves(moves);
            // Don't update stats for play board
            if (ringer.boardNum) {
                this.persistence.updateStats(this.solveStats);
            }
        }
        let hints = this.state.hints.slice();
        if (hints && hints.length > index && hints[index] > 0) {
            let depth = this.state.ringer.depth;
            hints[index] = (hints[index] + depth + 1) % depth;
        }
        this.setState({
            ringer: ringer,
            moves: moves,
            solved: solved,
            showDialog: showDialog,
            hints: hints,
            frame: 0,
            history: history,
        });
    }

    handleUndo() {
        this.solveStats.addUndo();
        let undone = this.state.history.undo();
        let hints = this.state.hints.slice();
        let depth = this.state.ringer.depth;
        undone.filter((index) => hints.length > index && hints[index] > 0)
            .forEach((index) => hints[index] = (hints[index] + depth + 1) % depth);
        this.setState({
            hints: hints,
        });
    }

    handleRedo() {
        this.solveStats.addRedo();
        let redone = this.state.history.redo();
        let hints = this.state.hints.slice();
        let depth = this.state.ringer.depth;
        redone.filter((index) => hints.length > index && hints[index] > 0)
            .forEach((index) => hints[index] = (hints[index] + depth + 1) % depth);
        this.setState({
            hints: hints,
        });
    }

    animate() {
        this.setState({
            frame: this.state.frame + 1,
        });
    }

    render() {
        let history = this.state.history;
        let solved = this.state.solved;
        let hints = this.state.hints;
        let showDialog = this.state.showDialog;
        return (
            <div className="App">
              <header className="App-header">
                <h1>Ringer</h1>
                <aside>{process.env.REACT_APP_VERSION}</aside>
                <Tabs name="options" showing={this.state.optionTab} onChange={this.handleOptionTabChange}>
                  <div label="Info" id="info-tab">
                    Tap any cell to flip the ring of cells around it.
                    The whole board is a ring, too: flipping a cell outside an edge flips the cell on the opposite edge!
                    Can you get all the cells to match?
                  </div>
                  <div label="New" id="option-tab">
                    <BoardPrefs
                      prefs={this.state.next}
                      onPrefChange={this.handlePrefChange}>
                    </BoardPrefs>
                    <div className="BoardButtons">
                      <button className="NewBoard"
                        onClick={this.newGame}>Shuffle!</button>
                    </div>
                  </div>
                  <div label="Debug" id='debug-tab'>
                    <div className="DebugButtons">
                      <button className="Save" onClick={this.saveBuffer}>Save</button>
                      <input className="BoardCode" type="text"/>
                      <button className="Load" onClick={this.loadBuffer}>Load</button>
                    </div>
                  </div>
                </Tabs>
                <div className="solving-buttons">
                  <button className="Undo" onClick={this.handleUndo} disabled={!history.canUndo()}>
                      Undo
                  </button>
                  <button className="Redo" onClick={this.handleRedo} disabled={!history.canRedo()}>
                      Redo
                  </button>
                  <button className="Hints" onClick={this.handleHints} disabled={solved}>
                      Hint?
                  </button>
                  <button className="Reset" onClick={this.handleReset}>Reset</button>
                </div>
                <ScoreBoard
                    moves={this.state.moves}
                    goal={this.state.ringer.goal}
                    elapsed={this.state.elapsed}
                    solved={solved}
                    boardNum={this.state.ringer.boardNum}
                />
              </header>
              <section className="App-content">
                <Board board={this.state.ringer}
                  history={history}
                  hints={solved ? [] : hints}
                  icons={this.state.icons}
                  onClick={this.makeMove}
                />
              </section>
              <Dialog active={showDialog} buttons={this.dialogButtons}>
                <Share ringer={this.state.ringer}/>
                <ScoreBoard
                    moves={this.state.moves}
                    goal={this.state.ringer.goal}
                    elapsed={this.state.elapsed}
                    solved={solved}
                    boardNum={this.state.ringer.boardNum}
                />
                <HighScores
                    current={this.solveStats}
                    datastore={this.persistence}
                />
              </Dialog>
            </div>
        );
    };

    // TODO: Pull this into a separate class. Maybe a subclass of Ringer?
    //
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
