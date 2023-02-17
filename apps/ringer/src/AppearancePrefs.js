import React from 'react';
import Cell from './Cell.js';
import './AppearancePrefs.css';

// The AppearancePrefs component displays all the inputs for initializing a new shuffled board
class AppearancePrefs extends React.Component {

    handleIconChange = (event) => {
        let icons = event.target.value;
        this.props.onIconChange(icons);
    }

    render() {
        let icons = this.props.icons;
        let demoCells = [];
        for (let i = 0; i < 5; i++) {
            let key = `DemoCell${i}`;
            demoCells.push(
                <Cell key={key} value={i} icons={icons} />
            ); 
        }
        /*
                <div className="appearanceButtons">
                  <button className="fullscreenButton"
                    onClick={this.handleFullscreen}>Fullscreen</button>
                </div>
                */
        return (
            <div className="AppearancePrefs">
                <div className="iconPrefs" key="iconPrefs">
                    <div className="demoCells">
                        {demoCells}
                    </div>
                    <label key="BoardSizeLabel">
                        <select key="boardIconSelect" value={icons} onChange={(e) => this.handleIconChange(e)}>
                            <option value="ringer-monochrome">monochrome</option>
                            <option value="ringer-suits">card suits</option>
                            <option value="ringer-emojis">emojis</option>
                        </select>
                    </label>
                </div>
            </div>
        );
    }

}

export default AppearancePrefs;
