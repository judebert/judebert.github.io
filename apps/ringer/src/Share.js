import React from 'react';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import './Share.css';

class Share extends React.Component {
    /* Building the preview characters
     * Unicode has squares, but they're not monochrome. Only black and white.
     * There is a different page with colors, including a gradient of brown, orange, and yellow.
     * Black:   2B1B ⬛️
     * Brown:  1F7EB 🟫
     * Orange: 1F7E7 🟧
     * Yellow: 1F7E8 🟨
     * White:   2B1C ⬜️
     * In Discord, the colored squares are slightly larger than the black-and-white
     *
     * Another option is combining characters https://codepoints.net/combining_diacritical_marks_for_symbols
     * There's a nice combining enclosing square at 20DE, but I can't figure out how to get it to work.
     * The variations here are OK, but Discord puts the combining square after the glyph.
     * Digit 1 0031, plus graphic variant FE0F, plus combining square 20DE: 1️⃞
     * White square 2B1C, plus combining square 20DE: ⬜⃞
     * The combining keycap 20E3 works with digit 1: 1⃣ (no graphical variation requested, show graphic in Discord)
     * But not the squares: ⬜⃣
     * Maybe a space?  ⃣1⃣2⃣3⃣ Why is it so different from the text digits? (Doesn't work at all in Discord)
     * What happens if I text/monochrome/VS15 FE0E a colored square? 🟧︎ (no diff)
     *
     * Maybe they'll combine better as suits?
     * ⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️
     * ⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️
     * ⬜️⬜️⬜️♣️♣️♣️⬜️⬜️⬜️
     * ⬜️♦️♦️⬜️⬜️⬜️♦️♦️⬜️
     * ⬜️❤️⬜️♠️⬜️♠️⬜️❤️⬜️
     * ⬜️♦️♦️⬜️⬜️⬜️♦️♦️⬜️
     * ⬜️⬜️⬜️♣️♣️♣️⬜️⬜️⬜️
     * ⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️
     * ⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️⬜️
     * Nope. Even in Discord, clubs are wider than squares but thinner than other suits.
     *
     * Colored squares it is.
     */
    constructor(props) {
        super(props);
        this.post = this._makePost();
        this.canShare = window.isSecureContext && navigator.canShare && navigator.share && navigator.canShare(this.post);
        this.shareButton = <button className="shareLink" onClick={this.sharePost} disabled={!this.canShare}>
            <ShareIcon/>
        </button>
        this.canCopy = window.isSecureContext && navigator.clipboard;
        this.copyButton = <button className="shareLink" onClick={this.copyPost} disabled={!this.canCopy}>
            <ContentCopyIcon/>
        </button>
    }

    tiles = [ '⬜️', '⬛️', '🟫', '🟧', '🟨', ];

    // Assumes the emojis above are equally sized, or in a monospace font.
    _makeTextGrid = () => {
        let size = this.props.ringer.size;
        let grid = this.props.ringer.gridFrom([]);
        let textGrid = '';
        for (let line = 0; line < size; line++) {
            for (let tile = 0; tile < size; tile++) {
                let cellDepth = grid[line * size + tile];
                textGrid += this.tiles[cellDepth];
            }
            textGrid += "\n";
        }
        return textGrid;
    }

    _makePost = () => {
        console.log(`Making with score: ${this.props.score}`);
        // Board number for URL and title
        let boardNum = this.props.ringer.boardNum.toString(16).toUpperCase();
        // Make URL
        let size = this.props.ringer.size;
        let depth = this.props.ringer.depth;
        let shuffles = this.props.ringer.shuffles;
        let url = new URL(`#${boardNum}:${size}+${shuffles}x${depth}`, window.location);
        // Make title
        let title = `Try Ringer board #${boardNum}!`;
        // Make the text from a score and grid
        let text = `${this._makeTextGrid()}`;
        if (this.props.score) {
            text = `My score: ${this.props.score}\n${text}`;
        }
        // Put them all in a post
        let post = {
            title: title,
            text: text,
            url: url.toString(),
        };
        return post;
    }

    sharePost = () => {
        if (!this.canShare) {
            console.error("Sharing is disabled, but someone still called sharePost!");
            alert("Sharing disabled!");
            return;
        }
        let post = this._makePost();
        navigator.share(post).catch((err) => {
            console.error(`Sharing failed: ${err}!`);
            console.dir('error:', err);
            console.dir('post:', post);
            alert(`Your system said it could share, but it failed!\n${err}\n\nYou'll have to share another way :(`);
        });
    }

    copyPost = () => {
        if (!this.canCopy) {
            console.error("Clipboard copy is disabled, but someone still called copyPost!");
            alert("Copy to clipboard disabled!");
            return;
        }
        let post = this._makePost();
        let text = `${post.title}\n${post.text}\n${post.url}`;
        navigator.clipboard.writeText(text)
            .then(() => { alert('Copied Ringer post to clipboard'); })
            .catch((err) => {
                console.error(`Clipboard writeText failed!: ${err}`);
                console.dir('error:', err);
                console.dir('text:', text);
                alert('Could not copy Ringer link to clipboard!');
            });
    }

    render = () => {
        return (
            <div className="shareButtons">
                {this.shareButton}
                {this.copyButton}
                <a href={this.url} className="shareLink"><OpenInNewIcon/></a>
            </div>
        );
    }
}

export default Share;
