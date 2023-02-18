import React from 'react';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

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

    _makePost = (url) => {
        return {
            title: "I found a neat Ringer board!",
            text: this._makeTextGrid(),
            url: url,
        };
    }

    sharePost = () => {
        let boardNum = this.props.ringer.boardNum.toString(16).toUpperCase();
        let size = this.props.ringer.size;
        let depth = this.props.ringer.depth;
        let shuffles = this.props.ringer.shuffles;
        let url = new URL(`#${boardNum}:${size}+${shuffles}x${depth}`, window.location);
        let post = this._makePost(url);
        if (window.isSecureContext && navigator.canShare && navigator.canShare(post)) {
            navigator.share(post);
            return;
        }
        navigator.clipboard.writeText(post.text + url)
            .then(() => { alert('Copied Ringer post to clipboard'); })
            .catch(() => { alert('Could not copy Ringer link to clipboard!');});
    }

    render = () => {
        let boardNum = this.props.ringer.boardNum.toString(16).toUpperCase();
        let size = this.props.ringer.size;
        let depth = this.props.ringer.depth;
        let shuffles = this.props.ringer.shuffles;
        let url = new URL(`#${boardNum}:${size}+${shuffles}x${depth}`, window.location);
        let post = this._makePost(url);
        let canShare = window.isSecureContext && navigator.canShare && navigator.canShare(post);
        let canCopy = window.isSecureContext && navigator.clipboard;
        let button = canShare ? <div className="ShareLink" onClick={this.sharePost}><ShareIcon/></div>
            : canCopy ? <div className="ShareLink" onClick={this.sharePost}><ContentCopyIcon/></div>
            : <a href={url} className="ShareLink"><OpenInNewIcon/></a>;
        return (
            <div className="Share-buttons">
                {button}
            </div>
        );
    }
}

export default Share;
