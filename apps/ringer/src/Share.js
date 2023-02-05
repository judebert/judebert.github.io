import React from 'react';

class Share extends React.Component {

    shareLink = () => {
        let boardNum = this.props.ringer.boardNum.toString(16).toUpperCase();
        let size = this.props.ringer.size;
        let depth = this.props.ringer.depth;
        let shuffles = this.props.ringer.shuffles;
        let url = new URL(`#${boardNum}:${size}+${shuffles}x${depth}`, window.location);
        navigator.clipboard.writeText(url)
            .then(() => { alert('Copied Ringer link to clipboard'); })
            .catch(() => { alert('Could not copy Ringer link to clipboard!');});
    }

    render = () => {
        let boardNum = this.props.ringer.boardNum.toString(16).toUpperCase();
        let size = this.props.ringer.size;
        let depth = this.props.ringer.depth;
        let shuffles = this.props.ringer.shuffles;
        let url = new URL(`#${boardNum}:${size}+${shuffles}x${depth}`, window.location);
        let button = navigator.clipboard && window.isSecureContext ? 
              <button className="ShareLink" onClick={this.shareLink}>Share link</button>
            : <div className="ShareLink">{url}</div>;
        return (
            <div className="Share-buttons">
                {button}
            </div>
        );
    }
}

export default Share;
