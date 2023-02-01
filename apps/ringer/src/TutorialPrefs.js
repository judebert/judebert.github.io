import React from 'react';
import BoardDatastore from './BoardDatastore.js';
//import './TutorialPrefs.css';

// The TutorialPrefs component displays all the inputs for loading a tutorial board
class TutorialPrefs extends React.Component {

    constructor(props) {
        super(props);
        if (!props.datastore) {
            this.datastore = new BoardDatastore();
        }
        let datastore = props.datastore ? props.datastore : this.datastore;
        this.options = datastore.getTutorialOptions();
    }

    handleBoardChange = (event) => {
        let prefs = Object.assign({}, this.props.prefs);
        prefs.tutorial.boardNum = parseInt(event.target.value);
        this.props.onPrefChange(prefs);
    }

    loadBoard = (event) => {
        this.props.onClick('tutorial');
    };

    render() {
        let prefs = this.props.prefs;
        return (
            <div className="TutorialPrefs">
              <label key="TutorialBoardLabel">Tutorial board:
                <select id="TutorialBoard" value={prefs.tutorial.boardNum} onChange={this.handleBoardChange}>
                  {this.options}
                </select>
              </label>
              <button type="button" className="TutorialLoadButton" onClick={this.loadBoard}>Try!</button>
            </div>
        );
    }
}

export default TutorialPrefs;
