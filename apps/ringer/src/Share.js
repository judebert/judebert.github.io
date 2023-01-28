import React from 'react';

class Share extends React.Component {

    shareLink(url) {
        navigator.clipboard.writeText(url)
            .then(() => { alert('Copied Ringer link to clipboard'); })
            .catch(() => { alert('Could not copy Ringer link to clipboard!');});
    }

    render() {
        let boardNum = this.props.ringer.boardNum.toString(16).toUpperCase();
        let url = new URL(`#${boardNum}`, window.location);
        let button = navigator.clipboard && window.isSecureContext ? 
              <button className="ShareLink" onClick={() => this.shareLink(url)}>Share link</button>
            : <div className="ShareLink">{url}</div>;
        return (
            <div className="Share-buttons">
                {button}
            </div>
        );
    }
}

export default Share;
