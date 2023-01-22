import React from 'react';
import './Cell.css';

// A Cell displays an icon for a single location on the torus.
class Cell extends React.Component {
    render() {
        let classes = [`Cell`,  `Cell-step-${this.props.value}`, `icons-${this.props.icons}`];
        // Can't be both a hint and a redo
        if (this.props.hint > 0) {
            classes.push(`Cell-hint`);
        } else if (this.props.redo > 0) {
            classes.push(this.props.redo === 1 ? `Cell-redo-1` : `Cell-redo`);
        }
        if (this.props.undo > 0) {
            classes.push(this.props.undo === 1 ? `Cell-undo-1` : `Cell-undo`);
        }
        let classNames = classes.join(' ');
        return (
            <button className={classNames}
                onClick = {(event) => this.props.onClick(this.props.coords)}>
            </button>
        );
    }
}

export default Cell;
