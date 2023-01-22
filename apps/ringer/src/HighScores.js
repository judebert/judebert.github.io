import React from 'react';

class HighScores extends React.Component {
    constructor(props) {
        super(props);
        this.MS_PER_SEC = 1000;
        this.SEC_PER_MIN = 60;
        this.SEC_PER_HOUR = 60 * this.SEC_PER_MIN;
        this.SEC_PER_DAY = 24 * this.SEC_PER_HOUR;
    }

    render() {
        let current = this.props.current;
        let datastore = this.props.datastore;
        if (!datastore || !current) {
            return (<div className="HighScore">No stats yet!</div>);
        }
        let bestIdenticals = datastore.getIdenticalStats(current)
            .map((scoreStat) => <div className="stats">
            <div className="boardNum">{scoreStat.boardNum}</div>
            <div className="moves">{scoreStat.moves}/{scoreStat.goal}</div>
            <div className="time">{this.timerString(scoreStat.time/this.MS_PER_SEC)}</div>
            <div className="hints">{scoreStat.hints}</div>
            <div className="resets">{scoreStat.undos}</div>
            <div className="undos">{scoreStat.undos}</div>
            <div className="redos">{scoreStat.redos}</div>
            </div>
        );
        let bestSizeGoal = datastore.getSizeGoalStats(current)
            .map((scoreStat) => <div className="stats">
            <div className="boardNum">{scoreStat.boardNum}</div>
            <div className="moves">{scoreStat.moves}/{scoreStat.goal}</div>
            <div className="time">{this.timerString(scoreStat.time/this.MS_PER_SEC)}</div>
            <div className="hints">{scoreStat.hints}</div>
            <div className="resets">{scoreStat.undos}</div>
            <div className="undos">{scoreStat.undos}</div>
            <div className="redos">{scoreStat.redos}</div>
            </div>
        );
        return (
            <div className="HighScores">
              <h3 className="identicalTitle">Best {current.size}x{current.size}/{current.goal} #{current.boardNum}</h3>
              <div className="identicalStats">{bestIdenticals}</div>
              <h3 className="sizeGoalTitle">Best {current.size}x{current.size}/{current.goal} any board</h3>
              <div className="sizeGoalStats">{bestSizeGoal}</div>
            </div>
        );
    }

    timerString(secs) {
        let display = "";
        let days = Math.floor(secs / this.SEC_PER_DAY);
        if (days > 0) {
            display += `${days}d`;
        }
        secs -= days * this.SEC_PER_DAY;
        let hours = Math.floor(secs / this.SEC_PER_HOUR);
        if (days > 0 || hours > 0) {
            display += String(hours).padStart(2, '0') + ':';
        }
        secs -= hours * this.SEC_PER_HOUR;
        let mins = Math.floor(secs / this.SEC_PER_MIN);
        display += String(mins).padStart(2, '0') + ':';
        secs -= mins * this.SEC_PER_MIN;
        display += String(secs).padStart(2, '0');
        return display;
    }
}

export default HighScores;
