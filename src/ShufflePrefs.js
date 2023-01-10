import React from 'react';

class ShufflePrefs extends React.Component {

    handleShuffleChange(shuffles) {
        let max = Math.floor(this.props.size * this.props.size * (this.props.depth - 1) / 2);
        let min = 0;
        this.props.onChange(Math.max(min, Math.min(max, shuffles)));
    }

    render() {
        return(
            <div className="ShufflePrefs">
                <label>Shuffles</label>
                <input type="number"
                    value={this.props.value}
                    min={0}
                    max={Math.floor(this.props.size * this.props.size * (this.props.depth - 1) / 2)} step={1}
                    onChange={(e) => this.handleShuffleChange(e.target.value)}
                />
            </div>
        );
    }
}

export default ShufflePrefs;
