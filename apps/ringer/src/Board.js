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
        let cells = grid.map((depth, index) => {
            let hintDepth = hints.length > index ? hints[index] : 0;
            let undoOrder = recent.indexOf(index) + 1;
            let redoOrder = undone.indexOf(index) + 1;
                return (<Cell coords={index}
                    key={`board${size}x${size}-${index}`}
                    icons={this.props.icons}
                    value={depth}
                    hint={hintDepth}
                    undo={undoOrder}
                    redo={redoOrder}
                    onClick={(index) => this.props.onClick(index)}
                />);
        });

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
