# Inspius website review

Static previews of the Inspius homepage and Recruitment Marketplace, with updated content, original theme icons and animations.

- Homepage: `index.html`
- Marketplace: `marketplace.html`

## Run locally

```sh
python3 -m http.server 4410 --bind 127.0.0.1
```

Open `http://127.0.0.1:4410/` and `http://127.0.0.1:4410/marketplace.html`.

## GitHub Pages

In repository **Settings → Pages**, select **Deploy from a branch**, branch **main**, folder **/(root)**.

The expected URLs after Pages is enabled are:

- https://tusgrace1306.github.io/demopage/
- https://tusgrace1306.github.io/demopage/marketplace.html

`.nojekyll` publishes the existing static files without Jekyll processing. All local asset links are relative so both pages also work under the repository subpath.

## Preview behavior

Forms are demonstrations and do not send or persist data. The Recruitment Service contact CTA opens the existing public inquiry page. Candidate actions and Login open the live application.

The CSS and animation scripts in `assets/css/` and `assets/js/` come from the supplied Inspius theme. Content-specific styles are in `marketplace-content.css`. Original SVG origins are documented in `icon-provenance.json`.

The storefront symbol uses the existing application’s Lucide Store icon; its license is in `assets/icons/LUCIDE-LICENSE.txt`.
