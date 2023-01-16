import React from 'react';
import Cell from './Cell.js';
import ShufflePrefs from './ShufflePrefs.js';
import './BoardPrefs.css';

// The BoardPrefs component displays all the inputs for initializing a new board
class BoardPrefs extends React.Component {

    handleIconChange(event) {
        let prefs = this.props.prefs;
        this.props.onPrefChange({
            size: parseInt(prefs.size),
            depth: parseInt(prefs.depth),
            icons: event.target.value,
            shuffles: parseInt(prefs.shuffles),
        });
    }

    handleSizeChange(event) {
        let prefs = this.props.prefs;
        this.props.onPrefChange({
            size: parseInt(event.target.value),
            depth: parseInt(prefs.depth),
            icons: prefs.icons,
            shuffles: parseInt(prefs.shuffles),
        });
    }

    handleDepthChange(event) {
        let prefs = this.props.prefs;
        this.props.onPrefChange({
            size: parseInt(prefs.size),
            depth: parseInt(event.target.value),
            icons: prefs.icons,
            shuffles: parseInt(prefs.shuffles),
        });
    }

    handleShuffleChange(shuffles) {
        let prefs = this.props.prefs;
        this.props.onPrefChange({
            size: parseInt(prefs.size),
            depth: parseInt(prefs.depth),
            icons: prefs.icons,
            shuffles: parseInt(shuffles),
        });
    }

    render() {
        let prefs = this.props.prefs;
        let demoCells = [];
        for (let i = 0; i < prefs.depth; i++) {
            let key = `DemoCell${i}`;
            demoCells.push(
                <Cell key={key} value={i} icons={prefs.icons} />
            ); 
        }
        return (
            <div className="BoardPrefs">
                <div className="BoardSizePrefs" key="BoardSizePrefs">
                    <label key="BoardSizeLabel">Board Size</label>
                    <select key="BoardSizeSelect" value={prefs.size} onChange={(e) => this.handleSizeChange(e)}>
                        <option value="5">5x5</option>
                        <option value="6">6x6</option>
                        <option value="7">7x7</option>
                        <option value="8">8x8</option>
                        <option value="9">9x9</option>
                        <option value="10">10x10</option>
                        <option value="11">11x11</option>
                        <option value="12">12x12</option>
                    </select>
                    <label key="BoardIconLabel"> Base</label>
                    <select key="BoardDepthSelect" value={prefs.depth} onChange={(e) => this.handleDepthChange(e)}>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                    </select>
                </div>
                <ShufflePrefs
                    key="ShufflePrefs"
                    value={prefs.shuffles}
                    size={prefs.size}
                    depth={prefs.depth}
                    onChange={(e) => this.handleShuffleChange(e)}
                />
            </div>
        );
    }

}

export default BoardPrefs;
