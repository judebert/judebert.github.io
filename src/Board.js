import React from 'react';
import Cell from './Cell.js';
import './Board.css';

// A Board displays Cells in a *square* grid.
// Why square? I can't figure out how to get CSS grid to condense all the cells together
// when it's NOT square. I wind up with a giant gutter in one dimension.
class Board extends React.Component {
    render() {
        let size = this.props.size;
        let cells = [];
        for (var y = 0; y < size; y++) {
            for (var x = 0; x < size; x++) {
                let index = y * size + x;
                cells.push(<Cell coords={[x, y]}
                    key={`board${size}x${size}-${x}-${y}`}
                    icons={this.props.icons}
                    value={this.props.cells[index]}
                    onClick={(x, y) => this.props.onClick(x, y)}
                />);
            }
        }

        return (
            <div className="Board" style={{
                gridTemplateColumns: `repeat(${this.props.size}, 1fr)`,
                gridTemplateRows: `repeat(${this.props.size}, 1fr`,
            }}>
                {cells}
            </div>
        );
    }
}

export default Board;
