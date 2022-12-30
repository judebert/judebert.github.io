import './App.css';
import React from 'react';
import Board from './Board.js';

class App extends React.Component {
    state = {
        size: 9,
        history: [Array(9 * 9).fill(null)],
        step: 0,
        icons: [0, 1],
    };
    render() {
        let current = this.state.history[this.state.step].slice();
        return (
            <div className="App">
              <header className="App-header">
                Ringer
              </header>
              <section className="App-content">
                <Board size={this.state.size} cells={current} icons={this.state.icons}/>
              </section>
            </div>
        );
    };
}

export default App;
