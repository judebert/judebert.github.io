import React from 'react';

class ShufflePrefs extends React.Component {

    handleShuffleChange(prefs, shuffles) {
        prefs.shuffles = "";
        if (!isNaN(shuffles)) {
            let max = Math.floor(prefs.size * prefs.size * (prefs.depth - 1) / 2);
            let min = 0;
            let shuffleInt = parseInt(shuffles);
            prefs.shuffles = Math.max(min, Math.min(max, shuffleInt));
        }
        this.props.onChange(prefs);
    }

    handleBoardnumChange(prefs, boardHex) {
        let max = Math.pow(2, 24);
        let boardNum = parseInt(boardHex, 16) || -1;
        boardNum = Math.min(max, boardNum);
        prefs.boardNum = boardNum;
        this.props.onChange(prefs);
    }

    render() {
        let prefs = this.props.prefs;
        let shuffles = parseInt(prefs.shuffles);
        if (isNaN(shuffles)) {
            shuffles = "";
        }
        let size = prefs.size;
        let depth = prefs.depth;
        let boardNum = prefs.boardNum;
        let boardHex = boardNum > 0 ? boardNum.toString(16).toUpperCase() : "";
        return (
            <div className="ShufflePrefs">
                <label>Shuffles
                  <input id='ShufflesInput' type="number"
                    value={shuffles}
                    min={0}
                    max={Math.floor(size * size * (depth - 1) / 2)}
                    step={1}
                    onChange={(e) => this.handleShuffleChange(prefs, e.target.value)}
                  />
                </label>
                <label>Next
                  <input id='BoardNumberInput' type="text"
                    value={boardHex}
                    maxLength={6}
                    pattern="^[0-9A-F]*$"
                    onChange={(e) => this.handleBoardnumChange(prefs, e.target.value)}
                  />
                </label>
            </div>
        );
    }
}

export default ShufflePrefs;
