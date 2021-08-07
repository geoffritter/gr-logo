# gr-logo
Geoff Ritter's personal logo rendered on canvas wrapped in a WebComponent.


# Usage
The only file needed for inclusion in an html page is gr-logo.js

If your are using any modern browser, then it's perfectly safe to include this
as an ES6 module.

```html
    <script src="./gr-logo.js" type="module" defer></script>
    <gr-logo>
```

OR

```javascript
    import GRLogo from './gr-logo.js';
    let grlogo = new GRLogo('random');
    document.body.append(grlogo);
```

OR Even

```javascript
    const moduleSpecifier = './gr-logo.js';
    import(moduleSpecifier)
    .then((module) => {
        let grlogo = new module.GRLogo('random');
        document.body.append(grlogo);
    });
```


# Transpiling
If you are using a build system that does transpiling, then you likely need to
include all the extensions for ES6 and custom elements. Honestly though, why
would you be including Geoff's logo in your build system? More likely you would
be including this as a resource to link back to geoffritter.com. In which case,
use the above methods.

<https://github.com/github/babel-plugin-transform-custom-element-classes><br>
<https://babeljs.io/docs/en/babel-plugin-transform-classes>