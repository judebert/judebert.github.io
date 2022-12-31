import React from 'react';
import './Cell.css';

// A Cell displays an icon for a single location on the torus.
class Cell extends React.Component {
    render() {
        const classes = [`Cell`,  `Cell-step-${this.props.value}`, `icons-${this.props.icons}`].join(' ');
        return (
            <button className={classes}
                onClick = {(event) => this.props.onClick(this.props.coords[0], this.props.coords[1])}>
            </button>
        );
    }
}

export default Cell;
