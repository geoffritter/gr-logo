/* Excluding the G with reversed R logo (Which is copyright 2005 by Geoff Ritter), this code is licensed under MIT (Expat) */

/**
 * Draws the GR Logo to a canvas in the given theme.
 */
class GRLogo extends HTMLElement {
    /**
     * Initializes the logo.
     * @param {string} theme to apply to the logo.
     */
    constructor(theme) {
        super();
        this.attachShadow({mode: 'open'});
        let style = document.createElement('style');
        style.innerText = ':host { display: block; position: relative; } canvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }';
        let canvas = document.createElement('canvas');
        this.shadowRoot.append(style, canvas);

        let t = theme || this.getAttribute('theme');
        this.setTheme(t);
        this._ctx = canvas.getContext('2d');
    }

    setTheme(theme) {
        let lastTheme = this._theme || THEMES.original;
        if (theme == 'random') {
            let keys = Object.keys(THEMES);
            this._theme = THEMES[keys[Math.random() * keys.length | 0]] || lastTheme;
        } else {
            let t = THEMES[theme];
            this._theme = t || lastTheme;
        }
    }

    static get observedAttributes() { return ['theme']; }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'theme') {
            this.setTheme(newValue);
            this._resize();
        }
    }

    /**
     * Draw the logo to the given context. For best results, the width and
     * height of the canvas should be the same size and set to the largest
     * dimention for the resolution you want.
     * @param {CanvasRenderingContext2D} context to render the logo to, defaults to own context.
     */
    draw(context) {
        let ctx = context || this._ctx;
        let w = this._ctx.canvas.width;
        let h = this._ctx.canvas.height;
        let x = Math.max(w, h);
        let scale = x / (SIZE.viewbox[2] - SIZE.viewbox[0]);

        ctx.scale(scale, scale);

        // BASE
        if (this._theme.base instanceof Array) {
            this._gradientFill(ctx, SIZE.basev[0], SIZE.basev[1], SIZE.basev[0], SIZE.basev[3], this._theme.base);
        } else {
            ctx.fillStyle = this._theme.base;
        }
        ctx.fill(PATHS.base);
        // BASE2
        if (this._theme.base2path) {
            ctx.fillStyle = this._theme.base2;
            ctx.fill(this._theme.base2path);
        }
        // R
        if (this._theme.outline == true) {
            // Outline stroke the R
            ctx.strokeStyle = this._theme.g;
            ctx.lineWidth = 5;
            ctx.stroke(PATHS.r);
            // If you want a pure outline stroke that supports a transparent fill for the shape,
            // You must render the outline to a back buffer, clip it there, then paste this back buffer to the canvas.
            // The below will leave a hole in the canvas.
            // ctx.save();
            // ctx.clip(PATHS.r, 'nonzero');
            // ALSO.... this is a x,y,width,height.... you would want to fix this.
            // ctx.clearRect(SIZE.r[0],SIZE.r[1],SIZE.r[2],SIZE.r[3]);
            // ctx.restore();
        }
        if (this._theme.r instanceof Array) {
            this._gradientFill(ctx, SIZE.rv[0], SIZE.rv[1], SIZE.rv[0], SIZE.rv[3], this._theme.r);
        } else {
            ctx.fillStyle = this._theme.r;
        }
        ctx.fill(PATHS.r);
        // G
        ctx.fillStyle = this._theme.g;
        ctx.fill(PATHS.g);
        // BAR
        if (x >= SIZE.minBarWidth) {
            ctx.fillStyle = this._theme.bar;
            ctx.fill(PATHS.bar);
        }
        // TEXT
        if (x >= SIZE.minTextWidth) {
            ctx.fillStyle = this._theme.text;
            ctx.fill(PATHS.text);
        }
    }

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

    _resize() {
        let x = Math.max(this.clientWidth, this.clientHeight);
        this._ctx.canvas.width = x;
        this._ctx.canvas.height = x;
        this.draw();
    }


    /**
     * Creates an evenly distributed linear gradient fill with solid transitions.
     * @param {Number} x0 start position
     * @param {Number} y0 start position
     * @param {Number} x1 end position
     * @param {Number} y1 end position
     * @param  {...ColorStrings} args 
     */
    _gradientFill(ctx, x0, y0, x1, y1, colors) {
        let fill = ctx.createLinearGradient(x0, y0, x1, y1);
        let totalColors = colors.length;
        let width = 1 / totalColors;
        for (let i = 0; i < totalColors; i++) {
            fill.addColorStop(width * i, colors[i]);
            if (i + 1 == totalColors) {
                fill.addColorStop(1, colors[i]);
            } else {
                fill.addColorStop(width * (i + 1), colors[i]);
            }
        }
        ctx.fillStyle = fill;
    }
}

const SIZE = {
    // x0, y0, x1, y1
    viewbox: [0, 0, 256, 256],
    basev: [0, 0, 256, 224], // viewable
    basef: [0, 0, 256, 256], // full
    g: [32, 32, 192, 192],
    rv: [59, 64, 224, 224], // viewable
    rf: [59, 64, 224, 236], // full
    bar: [0, 224, 256, 256],
    text: [21, 234, 235, 246],
    minTextWidth: 160,
    minBarWidth: 65
};

const PATHS = {
    base: new Path2D('M0,16a16 16 0 0 1 16-16h224a16 16 0 0 1 16 16V240a16 16 0 0 1-16 16H16a16 16 0 0 1-16-16Z'),
    r: new Path2D('M64,80a16 16 0 0 1 16-16h128a16 16 0 0 1 16 16v128a16 16 0 0 1-16 16h-16v-112a16 16 0 0 0-16-16h-64a 16 16 0 0 0-16 16v16h64v16a16 16 0 0 1-4.686 11.314l-80 80-11.3137085-11.3137085a16 16 0 0 1 0-22.627L105.37259 160H80a16 16 0 0 1-16-16Z'),
    g: new Path2D('M32,48a16 16 0 0 1 16-16h128a16 16 0 0 1 16 16v16h-112a16 16 0 0 0-16 16v64a16 16 0 0 0 16 16h64a16 16 0 0 0 16-16v-16h-64v-16a16 16 0 0 1 16-16h64a16 16 0 0 1 16 16v64a16 16 0 0 1-16 16h-128a16 16 0 0 1-16-16Z'),
    bar: new Path2D('M0,224h256v16a16 16 0 0 1-16 16h-224a16 16 0 0 1-16-16Z'),
    text: new Path2D('m 245.67967,249.8 -4.396,-6.3 c 2.548,-1.092 4.032,-3.248 4.032,-6.188 0,-4.396 -3.276,-7.112 -8.512,-7.112 h -8.484 v 19.6 h 4.536 v -5.46 h 3.948 0.224 l 3.78,5.46 z m -4.956,-12.488 c 0,2.128 -1.4,3.416 -4.172,3.416 h -3.696 v -6.832 h 3.696 c 2.772,0 4.172,1.26 4.172,3.416 z m -29.01232,8.848 v -4.536 h 9.1 v -3.528 h -9.1 v -4.256 h 10.304 v -3.64 h -14.812 v 19.6 h 15.176 v -3.64 z m -20.08028,3.64 h 4.536 v -15.904 h 6.272 V 230.2 h -17.08 v 3.696 h 6.272 z m -19.91221,0 h 4.536 v -15.904 h 6.272 V 230.2 h -17.08 v 3.696 h 6.272 z m -15.57232,0 h 4.536 v -19.6 h -4.536 z m -5.54829,0 -4.396,-6.3 c 2.548,-1.092 4.032,-3.248 4.032,-6.188 0,-4.396 -3.276,-7.112 -8.512,-7.112 h -8.484 v 19.6 h 4.536 v -5.46 h 3.948 0.224 l 3.78,5.46 z m -4.956,-12.488 c 0,2.128 -1.4,3.416 -4.172,3.416 h -3.696 v -6.832 h 3.696 c 2.772,0 4.172,1.26 4.172,3.416 z m -28.06463,-3.472 v -3.64 h -14.812 v 19.6 h 4.536 v -7.14 h 9.072 v -3.64 h -9.072 v -5.18 z m -20.220328,0 v -3.64 h -14.812 v 19.6 h 4.536 v -7.14 h 9.072 v -3.64 h -9.072 v -5.18 z m -31.280327,16.296 c 6.16,0 10.724,-4.284 10.724,-10.136 0,-5.852 -4.564,-10.136 -10.724,-10.136 -6.188,0 -10.724,4.312 -10.724,10.136 0,5.824 4.536,10.136 10.724,10.136 z m 0,-3.864 c -3.5,0 -6.132,-2.548 -6.132,-6.272 0,-3.724 2.632,-6.272 6.132,-6.272 3.5,0 6.132,2.548 6.132,6.272 0,3.724 -2.632,6.272 -6.132,6.272 z M 39.976647,246.16 v -4.536 h 9.1 v -3.528 h -9.1 v -4.256 h 10.304 v -3.64 h -14.812 v 19.6 h 15.176 v -3.64 z m -15.180328,-0.728 c -1.148,0.616 -2.296,0.84 -3.528,0.84 -3.752,0 -6.356,-2.604 -6.356,-6.272 0,-3.724 2.604,-6.272 6.412,-6.272 1.988,0 3.64,0.7 5.068,2.212 l 2.912,-2.688 c -1.904,-2.212 -4.76,-3.388 -8.204,-3.388 -6.244,0 -10.78,4.228 -10.78,10.136 0,5.908 4.536,10.136 10.696,10.136 2.8,0 5.768,-0.868 7.924,-2.492 v -7.952 h -4.144 z')
};

const THEMES = {
    original: {
        base: '#b40000',
        g: '#000000',
        r: '#FFFFFF',
        bar: '#000000',
        text: '#FFFFFF'
    },
    playfull: {
        base: '#00a0e3',
        g: '#ff78ff',
        r: '#ffb400',
        bar: '#131313',
        text: '#f7f7f7'
    },
    rainbow: {
        base: ['#e50000', '#ff8d00', '#ffee00', '#028121', '#004cff', '#770088'],
        g: '#000000',
        r: '#FFFFFF',
        bar: '#000000',
        text: '#FFFFFF'
    },
    philadelphia: {
        base: '#794E0F',
        g: '#000000',
        r: ['#e50000', '#ff8d00', '#ffee00', '#028121', '#004cff', '#770088'],
        bar: '#000000',
        text: '#FFFFFF'
    },
    transgender: {
        outline: true,
        base: ['#5BCFFB', '#F5ABB9', '#FFFFFF', '#F5ABB9', '#5BCFFB'],
        g: '#000000',
        r: '#FFFFFF',
        bar: '#000000',
        text: '#FFFFFF'
    },
    intersex: {
        outline: true,
        base: '#FFD800',
        g: '#7902AA',
        r: '#FFD800',
        bar: '#131313',
        text: '#f7f7f7'
    },
    other: {
        base: '#6BD6F7',
        base2path: new Path2D('M251.31371,4.68629A16 16 0 0 1 256 16V224H0Z'),
        base2: '#F9B2DB',
        g: '#ED1C24',
        r: '#FFFFFF',
        bar: '#000000',
        text: '#FFFFFF'
    }
}




customElements.define('gr-logo', GRLogo);