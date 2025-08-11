# Snowman Juice Machine (Web)

A small, self-contained web app that uses your webcam and pose detection to control an animated snowman in the Himalayas operating a hand press to make fresh juice. Move left/right to choose fruit; step closer for more soda and ice.

## Run

- Serve the folder with any static server. Example using Python:

```sh
python3 -m http.server -d . 8080
```

Then open `http://localhost:8080/snowman-juice-app/` and click "Start Camera".

If camera/model fails, it falls back to demo mode with mouse/keyboard control.