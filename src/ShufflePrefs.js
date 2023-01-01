import React from 'react';

class ShufflePrefs extends React.Component {

    handleShuffleChange(shuffles) {
        this.props.onChange(shuffles);
    }

    render() {
        return(
            <div className="ShufflePrefs">
                <label>Shuffles</label>
                <input type="number"
                    value={this.props.value}
                    min={0}
                    max={this.props.size * this.props.size * this.props.depth / 2} step={1}
                    onChange={(e) => this.handleShuffleChange(e.target.value)}
                />
            </div>
        );
    }
}

export default ShufflePrefs;
