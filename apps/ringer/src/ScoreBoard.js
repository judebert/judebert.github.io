import React from 'react';
import PropTypes from 'prop-types';
import Share from './Share.js';
import './ScoreBoard.css';

class ScoreBoard extends React.Component {
    static propTypes = {
        moves: PropTypes.number.isRequired,
        elapsed: PropTypes.number,
        solved: PropTypes.bool.isRequired,
    }

    constructor(props) {
        super(props);
        this.MS_PER_SEC = 1000;
        this.SEC_PER_MIN = 60;
        this.SEC_PER_HOUR = 60 * this.SEC_PER_MIN;
        this.SEC_PER_DAY = 24 * this.SEC_PER_HOUR;
    }

    render() {
        let timerStr = "--:--";
        let boardNum = this.props.ringer.boardNum;
        let boardHex = "------";
        if (boardNum) {
            boardHex = boardNum < 0 ? `Tutorial #${-boardNum}` :
                `#${Math.abs(boardNum).toString(16).padStart(6, '0').toUpperCase()}`;
            timerStr = this.timerString(Math.floor(this.props.elapsed / this.MS_PER_SEC));
        }
        let className = `ScoreBoard ${this.props.solved?'solved':'solving'}`;
        let shareScore = this.props.solved ? `${this.props.moves}/${this.props.ringer.goal} in ${timerStr}` : undefined;
        return (
            <>
            <div className={className}>
              <h4>{boardHex}</h4>
              <h3>{this.props.moves}/{this.props.ringer.goal}</h3>
              <h4>{timerStr}</h4>
            </div>
            <Share ringer={this.props.ringer} score={shareScore}/>
            </>
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

export default ScoreBoard;
