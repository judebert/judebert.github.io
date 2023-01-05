import React from 'react';
import './Cell.css';

// A Cell displays an icon for a single location on the torus.
class Cell extends React.Component {
    render() {
        let classes = [`Cell`,  `Cell-step-${this.props.value}`, `icons-${this.props.icons}`];
        // Can only be a hint or an undo/redo, not both
        if (this.props.hint > 0) {
            classes.push(`Cell-hint`);
        } else if (this.props.future > 0) {
            classes.push(`Cell-undo`);
        }
        let classNames = classes.join(' ');
        return (
            <button className={classNames}
                onClick = {(event) => this.props.onClick(this.props.coords[0], this.props.coords[1])}>
            </button>
        );
    }
}

export default Cell;
