import React from 'react';
// import Ringer from './Ringer.js';
import Cell from './Cell.js';
import './Board.css';

// A Board displays Cells in a *square* grid.
// Why square? I can't figure out how to get CSS grid to condense all the cells together
// when it's NOT square. I wind up with a giant gutter in one dimension.
// I guess it leaves a convenient place for controls and such.
class Board extends React.Component {
    render() {
        let ringer = this.props.board;
        let history = this.props.history;
        let recent = history.current().reverse();
        let undone = history.undone();
        let grid = ringer.gridFrom(recent);
        let size = ringer.size;
        let hints = this.props.hints;
        let cells = [];
        recent = recent.map((move) => ringer._asIndex(move));
        undone = undone.map((move) => ringer._asIndex(move));
        for (var y = 0; y < size; y++) {
            for (var x = 0; x < size; x++) {
                let index = y * size + x;
                let hintDepth = hints.length > index ? hints[index] : 0;
                let undoOrder = recent.indexOf(index) + 1;
                let redoOrder = undone.indexOf(index) + 1;
                cells.push(<Cell coords={[x, y]}
                    key={`board${size}x${size}-${x}-${y}`}
                    icons={this.props.icons}
                    value={grid[index]}
                    hint={hintDepth}
                    past={undoOrder}
                    future={redoOrder}
                    onClick={(x, y) => this.props.onClick(x, y)}
                />);
            }
        }

        return (
            <div className="Board" style={{
                gridTemplateColumns: `repeat(${size}, 1fr)`,
                gridTemplateRows: `repeat(${size}, 1fr`,
            }}>
                {cells}
            </div>
        );
    }
}

export default Board;
