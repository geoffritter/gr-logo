/**
 * Defines the custom element for the official G with reversed R logo for Geoff Ritter
 * @module 'gr-logo.js'
 * @license
 * <p>The G with reversed R logo is Copyright (c) 2005 by Geoff Ritter.</p>
 *
 * <p>This logo can not be used for any reason other than promoting or linking back to
 * geoffritter.com, Geoff Ritter him self or associated ventures.</p>
 *
 * <p>The Javascript and HTML code, excluding the paths used to draw the logo, are
 * Copyright (c) 2021 by Geoff Ritter and licensed under MIT (Expat)</p>
 *
 * <p>MIT License (Expat)</p>
 *
 * <p>Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:</p>
 *
 * <p>The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.</p>
 *
 * <p>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.</p>
 */

/**
 * Initializes a new instance of the GRLogo custom element.
 * @param {THEME_NAME} [theme] The theme to apply to the logo.
 * @classdesc Draws the GR Logo to a canvas in the given theme.
 */
class GRLogo extends HTMLElement {
    constructor(theme) {
        super();
        if (theme) { this.theme = t; }
        this.attachShadow({mode: 'open'});
        let style = document.createElement('style');
        style.innerText = ':host { display: block; position: relative; } canvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }';
        let canvas = document.createElement('canvas');
        let backBuffer = document.createElement('canvas');
        this.shadowRoot.append(style, canvas);
        this._ctx = canvas.getContext('2d');
        this._bctx = backBuffer.getContext('2d');
        this._animating = false;
    }

    /**
     * Sets the theme of the logo to one of the supported values.
     * @param {THEME_NAME} theme The name of the theme to set.
     */
    set theme(theme) {
        let lastTheme = this._theme || THEMES.original;
        if (theme == THEME_NAME.random) {
            let keys = Object.keys(THEME_NAME);
            // Exclude the test theme and assume it's the last theme defined.
            let selected = keys[Math.random() * (keys.length - 1) | 0];
            if (selected === THEME_NAME.test) {
                selected === lastTheme
            }
            this._theme = THEMES[selected] || lastTheme;
        } else {
            let t = THEME_NAME[theme];
            this._theme = THEMES[t] || lastTheme;
        }
        if (this._theme.fill === false) {
            this._fill = false;
        }
        if (this._ctx && !this._animating) {
            this._draw();
        }
    }

    /**
     * Gets the current fill state.
     */
    get fill() {
        return this._fill;
    }

    /**
     * Returns the size of the canvas inside the element.
     */
    get size() {
        return [this._ctx.canvas.clientWidth, this._ctx.canvas.clientHeight];
    }

    /**
     * Gets the margin width required by the logo styleguide.
     */
    get padding() {
        let size = Math.min(this.clientWidth, this.clientHeight);
        return size / 8;
    }

    static get observedAttributes() { return Object.keys(ATTRIBUTES); }

    attributeChangedCallback(name, oldValue, newValue) {
        switch(name) {
            case 'theme':
                this.theme = newValue;
                break;
            case 'fill':
                if (this._theme && this._theme.fill === false) {
                    this._fill = false;
                } else {
                    this._fill = (newValue !== null || newValue !== 'true');
                }
                this._resize();
                break;
        }
    }

    /**
     * Draw the static logo to the canvas.
     * @private
     */
    _draw() {
        this._ctx.save();

        let w = this._ctx.canvas.width;
        let h = this._ctx.canvas.height;
        this._ctx.clearRect(0, 0, w, h);

        let x = Math.min(w, h);
        let scale = x / (SIZE.viewbox[2] - SIZE.viewbox[0]);
        let reverseScale = (SIZE.viewbox[2] - SIZE.viewbox[0]) / x;
        this._ctx.setTransform(scale, 0, 0, scale, 0, 0);

        // Back buffer
        this._bctx.canvas.width = w;
        this._bctx.canvas.height = h;

        // Fill width/height
        let fw = w * reverseScale;
        let fh = h * reverseScale;

        // BASE
        if (this._fill) {
            let hor = fw - 32;
            let ver = fh - 32;
            let basepath = new Path2D(`M0,16a16 16 0 0 1 16-16h${hor}a16 16 0 0 1 16 16v${ver}a16 16 0 0 1-16 16h-${hor}a16 16 0 0 1-16-16Z`);
            this._drawElement(scale, null, basepath, this._theme.base, [0, 0, 0, ver])
        } else {
            this._drawElement(scale, null, PATHS.base, this._theme.base, [SIZE.basev[0], SIZE.basev[1], SIZE.basev[0], SIZE.basev[3]])
        }

        // BASE2
        if (this._theme.base2path) {
            // TODO: When set to fill, this path should be scaled to fit width/height and be clipped by the special basepath to get the rounded corners.
            this._drawElement(scale, null, this._theme.base2path, this._theme.base2, [SIZE.basev[0], SIZE.basev[1], SIZE.basev[0], SIZE.basev[3]])
        }

        // The GR should be centered horizontally in landscape and fill the height.
        // In portrait, the GR should fill the width and be spaced at the top normally.
        // (Total width - Scaled Viewbox Width) / 2
        let c = w > h ? (w - ((SIZE.viewbox[2] - SIZE.viewbox[0]) * scale) ) / 2 : 0;
        // R
        this._drawElement(scale, [c,0], PATHS.r, this._theme.r, [SIZE.rv[0], SIZE.rv[1], SIZE.rv[0], SIZE.rv[3]],
            this._theme.routlinew, this._theme.routlines, [SIZE.rv[0], SIZE.rv[1], SIZE.rv[0], SIZE.rv[3]]);
        // G
        this._drawElement(scale, [c,0], PATHS.g, this._theme.g, [SIZE.g[0], SIZE.g[1], SIZE.g[0], SIZE.g[3]])


        // BAR
        if (x >= SIZE.minBarWidth) {
            if (this._fill) {
                let barpath = new Path2D(`M0,${fh-32}H${fw}v16a16 16 0 0 1-16 16H16a16 16 0 0 1-16-16Z`);
                this._drawElement(scale, null, barpath, this._theme.bar, [0, 0, fw, 0])
            } else {
                let barpath = this._theme.barpath || PATHS.bar;
                this._drawElement(scale, null, barpath, this._theme.bar, [SIZE.bar[0], 0, SIZE.bar[2], 0])
            }
        }

        // TEXT
        if (x >= SIZE.minTextWidth) {
            if (this._fill) {
                this._ctx.save();
                this._ctx.transform(1, 0, 0, 1 , (fw/2)-((SIZE.viewbox[2]-SIZE.viewbox[0])/2), fh-256);
            }
            if (this._theme.text instanceof Array) {
                this._ctx.fillStyle = this._createSoftLinearGradient(SIZE.text[0], SIZE.text[1], SIZE.text[2], SIZE.text[1], this._theme.text);
            } else {
                this._ctx.fillStyle = this._theme.text;
            }
            this._ctx.fillStyle = this._theme.text;
            this._ctx.fill(PATHS.text);
            if (this._fill) {
                this._ctx.restore();
            }
        }

        this._ctx.restore();

        //this._drawTestGrid();
    }

    _drawTestGrid() {
        this._ctx.save();

        let w = this._ctx.canvas.width;
        let h = this._ctx.canvas.height;

        let x = Math.min(w, h);
        let size = x / 8;
        let countw = w / size | 0;
        let counth = h / size | 0;
        let vpath = new Path2D(`m0,0V${h}`);
        let hpath = new Path2D(`m0,0H${w}`);
        this._ctx.lineWidth = 1;
        this._ctx.strokeStyle = '#00FFFF';
        for (let i = 0; i <= countw; i++) {
            this._ctx.setTransform(1, 0, 0, 1, size * i, 0);
            this._ctx.stroke(vpath);
        }
        for (let i = 0; i < counth; i++) {
            this._ctx.setTransform(1, 0, 0, 1, 0, size * i);
            this._ctx.stroke(hpath);
        }
        this._ctx.strokeStyle = '#FF0000';
        this._ctx.setTransform(1,0,0,1,w/2,0);
        this._ctx.stroke(vpath);
        this._ctx.setTransform(1,0,0,1,0,h/2);
        this._ctx.stroke(hpath);
        this._ctx.restore();
    }

    /**
     * Full definition for drawing an element. For plain elements with solid color fill and no outline, this causes extra checks. 
     * @private
     * @param {Number} scale                         The scale to draw at.
     * @param {OFFSET} offset                        The offset within the scaled units to draw at.
     * @param {Path2D} path                          The path to draw.
     * @param {(COLOR|GRADIENT)} style               The fill color of the path.
     * @param {GRADIENT_SIZE} [gradientSize]         The gradient coordinates in the scaled units.
     * @param {Number} [outlineWidth]                The width of the outside stroke.
     * @param {(COLOR|GRADIENT)} [outlineStyle]      The fill color of the outline.
     * @param {GRADINET_SIZE} [outlineGradientSize]  The gradient coordinates of the outline in the scaled units.
     */
    _drawElement(scale, offset, path, style, gradientSize, outlineWidth, outlineStyle, outlineGradientSize) {
        let o = [0, 0];
        if (offset) {
            o = offset;
        };
        if (outlineWidth) {
            if (!gradientSize) {
                gradientSize = [0, 0, this._ctx.width, this._ctx.height];
            }
            // Stroke the path using the back buffer.
            this._bctx.save();
            this._bctx.setTransform(1, 0, 0, 1, 0, 0);
            this._bctx.clearRect(0, 0, this._bctx.canvas.width, this._bctx.canvas.height);
            this._bctx.setTransform(scale, 0, 0, scale, o[0], o[1]);
            if (outlineStyle instanceof Array) {
                if (!outlineGradientSize) {
                    outlineGradientSize = gradientSize;
                }
                this._bctx.strokeStyle = this._createHardLinearGradient(outlineGradientSize[0], outlineGradientSize[1], outlineGradientSize[2], outlineGradientSize[3], outlineStyle);
            } else {
                this._bctx.strokeStyle = outlineStyle;
            }
            // This is an outline stroke, double the width then cut out the base path. This allows you to use a transparent color for the path.
            this._bctx.lineWidth = outlineWidth * 2;
            this._bctx.stroke(path);
            this._bctx.save();
            this._bctx.globalCompositeOperation = 'destination-out';
            this._bctx.fillStyle = '#000000';
            this._bctx.fill(path);
            this._bctx.restore();
            this._bctx.restore();
            this._ctx.save();
            this._ctx.setTransform(1, 0, 0, 1, 0, 0);
            this._ctx.drawImage(this._bctx.canvas, 0, 0);
            this._ctx.restore();
        }
        // Draw the path directly to the canvas.
        if (style instanceof Array) {
            this._ctx.fillStyle = this._createHardLinearGradient(gradientSize[0], gradientSize[1], gradientSize[2], gradientSize[3], style);
        } else {
            this._ctx.fillStyle = style;
        }
        this._ctx.save();
        this._ctx.setTransform(scale, 0, 0, scale, o[0], o[1]);
        this._ctx.fill(path);
        this._ctx.restore();
    }

    /**
     * Ensures a fresh draw of the logo and sets up a ResizeObserver to redraw the logo at the full size.
     * @private
     */
    connectedCallback() {
        this._resize();
        // Rate limit the redraw when element is resized. Not absolutely needed for low resource pages.
        let resizing;
        let ro = new ResizeObserver(() => {
            clearTimeout(resizing);
            resizing = setTimeout(this._resize.bind(this), 200);
        });
        ro.observe(this);
    }


    /**
     * Resizes the canvas to draw at the full resolution allowed.
     * @private
     */
    _resize() {
        if (this._fill) {
            this._ctx.canvas.width = this.clientWidth;
            this._ctx.canvas.height = this.clientHeight;
            // Prevents streatching on resizing.
            this._ctx.canvas.style.width = this.clientWidth + 'px';
            this._ctx.canvas.style.height = this.clientHeight + 'px';
        } else {
            let x = Math.min(this.clientWidth, this.clientHeight);
            this._ctx.canvas.width = x;
            this._ctx.canvas.height = x;
            this._ctx.canvas.style.width = x + 'px';
            this._ctx.canvas.style.height = x + 'px';
        }

        // Backbuffer always resized in draw.
        // this._bctx.canvas.width = x;
        // this._bctx.canvas.height = x;
        if (!this._animating) {
            // If animating, it will pick up a new draw on the next frame.
            this._draw();
        }
    }


    /**
     * Creates an evenly distributed linear gradient fill with solid transitions.
     * @private
     * @param {Number} x0 start position
     * @param {Number} y0 start position
     * @param {Number} x1 end position
     * @param {Number} y1 end position
     * @param  {...String} colors 
     * @returns {CanvasGradient} The defined gradient.
     */
    _createHardLinearGradient(x0, y0, x1, y1, colors) {
        this._ctx.save();
        let gradient = this._ctx.createLinearGradient(x0, y0, x1, y1);
        let totalColors = colors.length;
        let width = 1 / totalColors;
        for (let i = 0; i < totalColors; i++) {
            gradient.addColorStop(width * i, colors[i]);
            if (i + 1 == totalColors) {
                gradient.addColorStop(1, colors[i]);
            } else {
                gradient.addColorStop(width * (i + 1), colors[i]);
            }
        }
        this._ctx.restore()
        return gradient;
    }

    /**
     * Creates an evenly distributed linear gradient fill with soft transitions.
     * @private
     * @param {Number} x0        x start position on the canvas.
     * @param {Number} y0        y start position on the canvas.
     * @param {Number} x1        x end position on the canvas.
     * @param {Number} y1        y end position on the canvas.
     * @param  {GRADIENT} colors The list of colors to fill the gradient with.
     * @returns {CanvasGradient} The defined gradient.
     */
    _createSoftLinearGradient(x0, y0, x1, y1, colors) {
        this._ctx.save();
        let gradient = this._ctx.createLinearGradient(x0, y0, x1, y1);
        let totalColors = colors.length;
        let width = 1 / totalColors;
        for (let i = 0; i < totalColors - 1; i++) {
            gradient.addColorStop(width * i, colors[i]);
        }
        gradient.addColorStop(1, colors[totalColors - 1]);
        this._ctx.restore()
        return gradient;
    }
}

/**
 * The attributes used by the element.
 * @enum {String}
 */
const ATTRIBUTES = {
    /** Sets the theme of the logo. */
    theme: 'theme',
    /** Lets the background resize to fill the space instead of a square. */
    fill: 'fill'
}

/**
 * The bounding box of a path within the overall path's size.
 * @typedef BOUNDINGBOX
 * @private
 * @type {array}
 * @property {number} 0 top left x position of box.
 * @property {number} 1 top left y position of box.
 * @property {number} 2 bottom right x position of box.
 * @property {number} 3 bottom right y position of box.
 */

/**
 * @typedef {string} COLOR A DOMString parsed as a CSS &lt;color&gt;
 * @private
 */

/**
 * @typedef {COLOR[]} GRADIENT Defines a linear gradient's colors. TODO: The code does not support selecting hard/soft gradients or direction yet.
 * @private
 */

/**
 * @typedef GRADIENT_SIZE
 * @private
 * @type {array}
 * @property {number} 0 x start position.
 * @property {number} 1 y start position.
 * @property {number} 2 x end position.
 * @property {number} 3 y end position.
 */

/**
 * Bounding boxes with relation to the units used in the finalized paths.
 * @private
 * @property {BOUNDINGBOX} viewbox the full area used by the combined paths.
 * @property {BOUNDINGBOX} basev   the viewable area of the background above the bar.
 * @property {BOUNDINGBOX} basef   the full area of the background including under the bar.
 * @property {BOUNDINGBOX} g       The area of the G path.
 * @property {BOUNDINGBOX} rv      The viewable ares of the R above the bar.
 * @property {BOUNDINGBOX} rf      The full area of the R including under the bar.
 * @property {BOUNDINGBOX} bar     The area of the bar at the bottom of the logo.
 * @property {BOUNDINGBOX} text    The area of the text on the bar.
 * @property {Number} minTextWidth The minimum width of the logo, required by the style guide, to be able to display the text.
 * @property {Number} minBarWidth  The minimum width of the logo, required by the style guide, to be able to display the bar.
 */
const SIZE = {
    viewbox: [0, 0, 256, 256],
    basev: [0, 0, 256, 224],
    basef: [0, 0, 256, 256],
    gr: [32, 32, 192, 192],
    g: [32, 32, 192, 192],
    rv: [59, 64, 224, 224],
    rf: [59, 64, 224, 236],
    bar: [0, 224, 256, 256],
    text: [21, 234, 235, 246],
    minTextWidth: 160,
    minBarWidth: 65
};

/**
 * The finalized logo paths using arcs instead of bezier curves.
 * @type {object.<string, Path2D>}
 * @private
 */
const PATHS = {
    base: new Path2D('M0,16a16 16 0 0 1 16-16h224a16 16 0 0 1 16 16V240a16 16 0 0 1-16 16H16a16 16 0 0 1-16-16Z'),
    r: new Path2D('M64,80a16 16 0 0 1 16-16h128a16 16 0 0 1 16 16v128a16 16 0 0 1-16 16h-16v-112a16 16 0 0 0-16-16h-64a 16 16 0 0 0-16 16v16h64v16a16 16 0 0 1-4.686 11.314l-80 80-11.3137085-11.3137085a16 16 0 0 1 0-22.627L105.37259 160H80a16 16 0 0 1-16-16Z'),
    g: new Path2D('M32,48a16 16 0 0 1 16-16h128a16 16 0 0 1 16 16v16h-112a16 16 0 0 0-16 16v64a16 16 0 0 0 16 16h64a16 16 0 0 0 16-16v-16h-64v-16a16 16 0 0 1 16-16h64a16 16 0 0 1 16 16v64a16 16 0 0 1-16 16h-128a16 16 0 0 1-16-16Z'),
    bar: new Path2D('M0,224h256v16a16 16 0 0 1-16 16h-224a16 16 0 0 1-16-16Z'),
    text: new Path2D('m 245.67967,249.8 -4.396,-6.3 c 2.548,-1.092 4.032,-3.248 4.032,-6.188 0,-4.396 -3.276,-7.112 -8.512,-7.112 h -8.484 v 19.6 h 4.536 v -5.46 h 3.948 0.224 l 3.78,5.46 z m -4.956,-12.488 c 0,2.128 -1.4,3.416 -4.172,3.416 h -3.696 v -6.832 h 3.696 c 2.772,0 4.172,1.26 4.172,3.416 z m -29.01232,8.848 v -4.536 h 9.1 v -3.528 h -9.1 v -4.256 h 10.304 v -3.64 h -14.812 v 19.6 h 15.176 v -3.64 z m -20.08028,3.64 h 4.536 v -15.904 h 6.272 V 230.2 h -17.08 v 3.696 h 6.272 z m -19.91221,0 h 4.536 v -15.904 h 6.272 V 230.2 h -17.08 v 3.696 h 6.272 z m -15.57232,0 h 4.536 v -19.6 h -4.536 z m -5.54829,0 -4.396,-6.3 c 2.548,-1.092 4.032,-3.248 4.032,-6.188 0,-4.396 -3.276,-7.112 -8.512,-7.112 h -8.484 v 19.6 h 4.536 v -5.46 h 3.948 0.224 l 3.78,5.46 z m -4.956,-12.488 c 0,2.128 -1.4,3.416 -4.172,3.416 h -3.696 v -6.832 h 3.696 c 2.772,0 4.172,1.26 4.172,3.416 z m -28.06463,-3.472 v -3.64 h -14.812 v 19.6 h 4.536 v -7.14 h 9.072 v -3.64 h -9.072 v -5.18 z m -20.220328,0 v -3.64 h -14.812 v 19.6 h 4.536 v -7.14 h 9.072 v -3.64 h -9.072 v -5.18 z m -31.280327,16.296 c 6.16,0 10.724,-4.284 10.724,-10.136 0,-5.852 -4.564,-10.136 -10.724,-10.136 -6.188,0 -10.724,4.312 -10.724,10.136 0,5.824 4.536,10.136 10.724,10.136 z m 0,-3.864 c -3.5,0 -6.132,-2.548 -6.132,-6.272 0,-3.724 2.632,-6.272 6.132,-6.272 3.5,0 6.132,2.548 6.132,6.272 0,3.724 -2.632,6.272 -6.132,6.272 z M 39.976647,246.16 v -4.536 h 9.1 v -3.528 h -9.1 v -4.256 h 10.304 v -3.64 h -14.812 v 19.6 h 15.176 v -3.64 z m -15.180328,-0.728 c -1.148,0.616 -2.296,0.84 -3.528,0.84 -3.752,0 -6.356,-2.604 -6.356,-6.272 0,-3.724 2.604,-6.272 6.412,-6.272 1.988,0 3.64,0.7 5.068,2.212 l 2.912,-2.688 c -1.904,-2.212 -4.76,-3.388 -8.204,-3.388 -6.244,0 -10.78,4.228 -10.78,10.136 0,5.908 4.536,10.136 10.696,10.136 2.8,0 5.768,-0.868 7.924,-2.492 v -7.952 h -4.144 z')
};

/**
 * Allowed names that can be supplied to the attribute 'theme'.
 * @enum {String}
 */
export const THEME_NAME = {
    /** The original red, black, and white logo. */
    original: 'original',
    /** A playful coloring of the logo. */
    playfull: 'playfull',
    /** A classy styling of the text on the original logo. */
    classy: 'classy',
    /** Pride flag background. */
    rainbow: 'rainbow',
    /** Philadelphia pride flag inspired. */
    philadelphia: 'philadelphia',
    /** Transgender pride flag background. */
    transgender: 'transgender',
    /** Intersex pride flag inspired. */
    intersex: 'intersex',
    /** Other style background. */
    other: 'other',
    /** GR on empty space */
    gr: 'gr',
    /** GR black and white variant */
    blackwhite: 'blackwhite',
    /** Test background used to view all the features of the logo. */
    test: 'test'
};

/**
 * @typedef {object} THEME_DEFINITION defines what can be configured for a theme.
 * @private
 * @property {COLOR|GRADIENT} base         The base color of the background.
 * @property {Path2D} [base2path]          A new path to add to the logo's background.
 * @property {COLOR|GRADIENT} [base2]      The color of the new base path.
 * @property {COLOR|GRADIENT} g            The color of the G path.
 * @property {COLOR|GRADIENT} r            The color of the reversed R path.
 * @property {Number} [routlinew]          The width of the outside stroke of the reversed R path.
 * @property {COLOR|GRADIENT} [routlines]  The color of the stroke of the reversed R path.
 * @property {COLOR|GRADIENT} bar          The color of the bar at the bottom.
 * @property {COLOR|GRADIENT} text         The color of the text at the bottom.
 */

/**
 * object containing all the THEME_DEFINITIONS.
 * @private
 * @type {object.<string, THEME_DEFINTION>}
 */
const THEMES = {
    original: {
        base: '#B40000',
        g: '#000000',
        r: '#FFFFFF',
        bar: '#000000',
        text: '#FFFFFF'
    },
    playfull: {
        base: '#00A0E3',
        g: '#FF78FF',
        r: '#FFB400',
        bar: '#131313',
        text: '#F7F7F7'
    },
    classy: {
        base: '#B40000',
        g: '#000000',
        r: '#FFFFFF',
        routlinew: 8,
        routlines: '#000000',
        routlines: ['#E50000', '#FF8D00', '#FFEE00', '#028121', '#004CFF', '#770088'],
        bar: ['#000000'],
        text: ['#E50000', '#FF8D00', '#FFEE00', '#028121', '#004CFF', '#770088'],
    },
    rainbow: {
        base: ['#E50000', '#FF8D00', '#FFEE00', '#028121', '#004CFF', '#770088'],
        g: '#000000',
        r: '#FFFFFF',
        bar: '#000000',
        text: '#FFFFFF'
    },
    philadelphia: {
        base: '#794E0F',
        g: '#000000',
        r: ['#E50000', '#FF8D00', '#FFEE00', '#028121', '#004CFF', '#770088'],
        bar: '#000000',
        text: '#FFFFFF'
    },
    transgender: {
        base: ['#5BCFFB', '#F5ABB9', '#FFFFFF', '#F5ABB9', '#5BCFFB'],
        g: '#000000',
        r: '#FFFFFF',
        routlinew: 4,
        routlines: '#000000',
        bar: '#000000',
        text: '#FFFFFF'
    },
    intersex: {
        base: '#FFD800',
        g: '#7902AA',
        r: '#FFD800',
        routlinew: 4,
        routlines: '#7902AA',
        bar: '#131313',
        text: '#F7F7F7'
    },
    other: {
        base: '#6BD6F7',
        base2path: new Path2D('M251.31371,4.68629A16 16 0 0 1 256 16V224H0Z'),
        base2: '#F9B2DB',
        g: '#ED1C24',
        r: '#FFFFFF',
        bar: '#000000',
        text: '#FFFFFF'
    },
    gr: {
        base: 'transparent',
        g: '#000000',
        r: '#FFFFFF',
        routlinew: 8,
        routlines: '#000000',
        bar: 'transparent',
        text: 'transparent'
    },
    blackwhite: {
        fill: false, // This theme cannot be scaled.
        base: 'transparent',
        g: '#000000',
        r: '#FFFFFF',
        routlinew: 8,
        routlines: '#000000',
        bar: '#000000',
        barpath: new Path2D('M16,256a16 16 0 0 1 0-32h224a16 16 0 0 1 0 32Z'),
        text: '#FFFFFF'
    },
    // Contains a full static feature test.
    test: {
        base: ['#888888', '#AAAAAA'],
        base2path: new Path2D('M251.31371,4.68629A16 16 0 0 1 256 16V224H0Z'),
        base2: ['#888833', '#AAAA88'],
        g: ['#FF6666', 'rgba(255,0,0,0.5)'],
        r: ['rgba(0,255,0,0.5)', 'rgba(128,255,128,0.5)', 'rgba(255,255,255,0.5'],
        routlinew: 4,
        routlines: ['#FF6666','rgba(255,0,0,0.5)'],
        bar: ['#000000', 'rgba(255,255,255,0.8)'],
        text: ['#e50000', '#ff8d00', '#ffee00', '#028121', '#004cff', '#770088']
    }
}

export default GRLogo;
customElements.define('gr-logo', GRLogo);