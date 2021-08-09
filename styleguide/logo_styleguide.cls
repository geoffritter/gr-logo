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
\newcommand*{\setlogopath}[1]{\def\@logopath{#1}}

% View commands
% Header
\newcommand\header{%
    \includesvg[width=1in, height=1in]{\@logopath}
}

% 