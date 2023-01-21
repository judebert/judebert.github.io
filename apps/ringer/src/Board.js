import React from 'react';
// import Ringer from './Ringer.js';
import Cell from './Cell.js';
import './Board.css';

// A Board displays Cells in a *square* grid.
// Why square? I can't figure out how to get CSS grid to condense all the cells together
// when it's NOT square. I wind up with a giant gutter in one dimension.
class Board extends React.Component {
    render() {
        let ringer = this.props.board;
        let step = this.props.step;
        let grid = ringer.gridFrom(this.props.moves.slice(0, step));
        let size = ringer.size;
        let hints = this.props.hints;
        let past = this.props.past;
        let future = this.props.future;
        let cells = [];
        for (var y = 0; y < size; y++) {
            for (var x = 0; x < size; x++) {
                let index = y * size + x;
                let hintDepth = hints.length > index ? hints[index] : 0;
                let pastDepth = past.length > index ? past[index] : 0;
                let futureDepth = future.length > index ? future[index] : 0;
                cells.push(<Cell coords={[x, y]}
                    key={`board${size}x${size}-${x}-${y}`}
                    icons={this.props.icons}
                    value={grid[index]}
                    hint={hintDepth}
                    past={pastDepth}
                    future={futureDepth}
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
