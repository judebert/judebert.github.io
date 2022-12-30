import './App.css';
import React from 'react';
import Board from './Board.js';

class App extends React.Component {
    state = {
        size: 9,
        history: [Array(9 * 9).fill(0)],
        step: 0,
        icons: [' ', '😡', '😠', '😟'],
    };

    // Increment all the cells in a ring around (x, y)
    ring(x, y) {
        let size = this.state.size;
        let step = this.state.step;
        let history = this.state.history.slice(0, step + 1);
        let current = history[step].slice();
        const neighbors = [
            [-1, -1], [0, -1], [1, -1],
            [-1, 0], [1, 0],
            [-1, 1], [0, 1], [1, 1],
        ];
        for (var [dx, dy] of neighbors) {
            const ringX = (x + dx + size) % size;
            const ringY = (y + dy + size) % size;
            const index = ringY * size + ringX;
            current[index] = (current[index] + 1) % this.state.icons.length;
        }
        history.push(current);
        this.setState({
            history: history,
            step: step + 1,
        });
    }

    render() {
        let history = this.state.history.slice();
        let step = this.state.step;
        let current = history[step].slice();
        return (
            <div className="App">
              <header className="App-header">
                Ringer
              </header>
              <section className="App-content">
                <Board size={this.state.size}
                  cells={current}
                  icons={this.state.icons}
                  onClick={(x, y) => this.ring(x, y)}/>
              </section>
            </div>
        );
    };
}

export default App;
