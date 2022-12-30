import React from 'react';
import './Cell.css';

// A Cell displays an icon for a single location on the torus.
class Cell extends React.Component {
    render() {
        return (
            <button className="Cell"
                onClick = {(event) => this.props.onClick(this.props.coords[0], this.props.coords[1])}>
                {this.props.icons[this.props.value]}
            </button>
        );
    }
}

export default Cell;
