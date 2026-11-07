# RDAP IP lookup demo

**[Open the live GitHub Pages demo →](https://cawigor.github.io/rdap-browser-demo/)**

A small static demo of [`@portable/rdap`](https://github.com/portablejs/portable/tree/main/packages/rdap) for looking up IPv4 and IPv6 registration data.

The lookup only starts after the user clicks **Look up**. The page displays the network details published through RDAP, such as the registered range, CIDR blocks, country, network type, and available organizations. It does not perform geolocation.

## Run locally

Requirements: Node.js 24 or later and npm.

```sh
npm install
npm run dev
```

Vite prints the local URL to open.

To check the production build locally:

```sh
npm run build
npm run preview
```

## GitHub Pages deployment

The workflow in `.github/workflows/pages.yml` builds the site and deploys the `dist` directory to GitHub Pages on every push to `main`.

The repository is configured to publish through GitHub Actions. The deployed site is available at [cawigor.github.io/rdap-browser-demo](https://cawigor.github.io/rdap-browser-demo/).

## Privacy and limitations

- No RDAP lookup is made when the page loads.
- When the user submits an address, the browser fetches IANA's RDAP bootstrap data if needed, then queries the RDAP server selected for that address. The IP address is therefore disclosed to the relevant registry's server.
- RDAP servers may block cross-origin browser requests with CORS. If that happens, the browser cannot read the response; a server-side proxy may be needed.
- Data comes from the registries and may be incomplete or inaccurate. The returned country is registration data, not a guaranteed physical location.
- This demo does not send the IP address to a GeoIP provider.

## License

This demo is licensed under the MIT License; see [`LICENSE`](LICENSE). `@portable/rdap` and its dependencies retain their respective licenses.
