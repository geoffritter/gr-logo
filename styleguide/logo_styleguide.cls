\LoadClass[10pt]{article}
\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{logo_styleguide}[2021/08/06 Logo Styleguide Class]

\RequirePackage[sfdefault]{noto}
\RequirePackage{fontspec}
\RequirePackage{titlesec}
\RequirePackage{hyperref}
\RequirePackage{fontawesome}
\RequirePackage{fontspec}
\RequirePackage{svg}
\RequirePackage{everypage}
\RequirePackage{array}
\RequirePackage{datetime}

% For demo and testing
\RequirePackage{lipsum}

% Setup
\pagestyle{empty}

\def\PageTopMargin{0.3in}
\def\PageLeftMargin{0.75in}
\def\PageRightMargin{0.75in}
\def\PageBottomMargin{0.6in}
\RequirePackage[letterpaper, left=\PageLeftMargin,top=\PageTopMargin,right=\PageLeftMargin,bottom=\PageBottomMargin]{geometry}

\newfontfamily\headingfont[Extension = .ttf, UprightFont = *-Bold]{Montserrat}
\titleformat*{\section}{\Large\headingfont\scshape}

\newcommand*{\sethomepage}[1]{\def\@homepage{#1}}

% My Title
\newcommand{\mytitle}{\LARGE\headingfont\@title\\[2em]\normalfont\normalsize}

% Character sized G, R, and GR shapes
\newcommand*{\gchar}{\raisebox{0\height}{\includesvg[width=0.15in, height=0.15in]{../src/gr-logo-g.svg}}}
\newcommand*{\rchar}{\raisebox{-.1\height}{\includesvg[width=0.16in, height=0.16in]{../src/gr-logo-r.svg}}}
\newcommand*{\grchar}{\raisebox{-.25\height}{\includesvg[width=0.25in, height=0.25in]{../src/gr-logo-gr.svg}}}

% All the various figures

% Logo Design
\newcommand{\logodesign}{\noindent\includesvg[width=\textwidth]{../src/gr-logo-design.svg}}

% Black and White
\newcommand{\logoblackwhite}{%
\begin{figure}[h]%
\hspace*{\fill}%
\includesvg[width=1.5in, height=1.5in]{../src/gr-logo-bw.svg}\hspace{0.1875in}%
\includesvg[width=1.5in, height=1.5in]{../src/gr-logo-gr.svg}%
\hspace*{\fill}%
\end{figure}
}

% Resizing the Logo
\newcommand{\logoresizing}{%
\begin{figure}[h]%
\hspace*{\fill}%
\includesvg[width=1.5in, height=1.5in]{../src/gr-logo.svg}\hspace{0.1875in}%
\includesvg[width=1.5in, height=1.5in]{../src/gr-logo-vertical.svg}\hspace{0.1875in}%
\includesvg[width=1.5in, height=1.5in]{../src/gr-logo-horizontal.svg}%
\hspace*{\fill}%
\end{figure}
}

% Warped is bad
\newcommand{\logowarped}{%
\begin{figure}[h]
\hspace*{\fill}%
\includesvg[width=8in, height=3in]{../src/gr-logo-warped.svg}%
\hspace*{\fill}
\end{figure}
}

% Outlined is bad
\newcommand{\logooutlined}{%
\begin{table}[!htb]
\begin{minipage}[t]{0.3333\textwidth}
\center
\includesvg[width=1.5in, height=1.5in]{../src/gr-logo-bw-outline.svg}\\
Inside Stroke with black and white is OK, but you shouldn't do it.
\end{minipage}\hspace{0.1875in}%
\begin{minipage}[t]{0.3333\textwidth}
\center
\includesvg[width=1.5in, height=1.5in]{../src/gr-logo-outline-bad.svg}\\
Don't do this. A stroke of the background is bad and does not produce compliant results.
\end{minipage}\hspace{0.1875in}%
\begin{minipage}[t]{0.3333\textwidth}
\center
\includesvg[width=1.5in, height=1.5in]{../src/gr-logo-outline-bad2.svg}\\
Outline stroke is also bad. It looks close, but the dimensions of the logo are now wrong.
\end{minipage}%
\end{table}
}