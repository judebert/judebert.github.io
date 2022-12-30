import React from 'react';

// A Cell displays an icon for a single location on the torus.
class Cell extends React.Component {
    render() {
        return (
            <button className="cell"
                onClick = {(event) => this.props.onClick(this.props.coords)}>
                {this.props.icons[this.props.value]}
            </button>
        );
    }
}

export default Cell;
