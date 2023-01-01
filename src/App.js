import './App.css';
import React from 'react';
import Board from './Board.js';

class App extends React.Component {
    state = {
        size: 9,
        history: [],
        step: 0,
        icons: 'ringer-monochrome',
        depth: 2,
    };

    render() {
        let step = this.state.step;
        let history = this.state.history.slice(0, step + 1);
        let grid = this.gridFrom(history);
        return (
            <div className="App">
              <header className="App-header">
                Ringer
              </header>
              <section className="App-content">
                <Board size={this.state.size}
                  cells={grid}
                  icons={this.state.icons}
                  onClick={(x, y) => this.makeMove(x, y)}
                />
              </section>
            </div>
        );
    };

    makeMove(x, y) {
        let step = this.state.step + 1;
        let history = this.state.history.slice(0, step).concat([[x, y]]);
        let current = this.gridFrom(history);
        this.setState({
            history: history,
            step: step,
        });
    }

    // Increment all the cells in a ring around (x, y) *mutating* the given grid
    ring(x, y, grid) {
        let size = this.state.size;
        let depth = this.state.depth;
        const neighbors = [
            [-1, -1], [0, -1], [1, -1],
            [-1, 0], [1, 0],
            [-1, 1], [0, 1], [1, 1],
        ];
        for (var [dx, dy] of neighbors) {
            const ringX = (x + dx + size) % size;
            const ringY = (y + dy + size) % size;
            const index = ringY * size + ringX;
            grid[index] = (grid[index] + 1) % depth;
        }
    }

    gridFrom(moves) {
        let size = this.state.size;
        let grid = new Array(size * size).fill(0);
        for (var [x, y] of moves) {
            this.ring(x, y, grid);  // Uses state: size and depth
        }
        return grid;
    }
}

export default App;
