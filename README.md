# Websocket/Browser based real-time visualization of lidar calibration

Allows to connect to the websocket server opened in the python online calibrator and visualize the running calibration for multiple sensors in real time.

## Building
1. Install nodejs/npm (see [here](https://nodejs.org/en/download/), or [here for Ubuntu-based linux distros](https://nodejs.org/en/download/package-manager/all#debian-and-ubuntu-based-linux-distributions))
2. Clone this repo
3. Install dependencies via npm: `npm install`
4. Build the project: `npm run build`
5. There will be a single HTML bundle `index.html` inside the `dist` directory, which can either be served via any HTTP server (e.g. `python3 -m http.server --directory /dir/to/indexhtml`) or be opened locally in a browser (doubleclick/menu: open with)

## Development
1. Execute steps 1-3 of the build instructions.
2. Run `npm run dev` for a development server, which automatically updates the browser page as code changes.