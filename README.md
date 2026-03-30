# Hybrid AR Pizza Lab

A hybrid marker-based + markerless augmented reality web app. Present a QR code containing pizza JSON to the camera and the app will parse it, generate a 3D pizza, and render it over the live feed. Switch to markerless mode to place the pizza on a detected surface using WebXR when supported.

## Features
- Live camera permission handling
- QR scanning from the camera feed using `jsQR`
- JSON validation and error feedback
- Marker-based AR placement using QR corners
- Markerless placement with WebXR hit-test fallback to orbit preview
- Dynamic 3D pizza generation with toppings
- Smooth appearance animation
- Rotation, scale, and position controls
- Screenshot capture and JSON download

## Project Structure
- `hybrid-ar-pizza/`
- `hybrid-ar-pizza/client/`
- `hybrid-ar-pizza/client/src/`
- `hybrid-ar-pizza/client/src/components/`
- `hybrid-ar-pizza/client/src/hooks/`
- `hybrid-ar-pizza/client/src/utils/`
- `hybrid-ar-pizza/client/src/ar/`

## Installation
1. `cd /Users/akarsh/hack1/IF/hybrid-ar-pizza`
2. `npm install`
3. `npm run dev`

Open the local dev server URL printed by Vite.

## QR JSON Format
Example payload:
```json
{
  "name": "Pepperoni Supreme",
  "size": "large",
  "crust": "cheese burst",
  "toppings": ["pepperoni", "olives", "mushroom"],
  "price": 399
}
```

## Usage
- Marker based mode: show a QR code with pizza JSON in front of the camera.
- Markerless mode: tap the AR button (if supported) and tap to place the pizza.
- Use the control panel to rotate, scale, or offset the pizza.
- Use Screenshot to save a PNG, and Download JSON to save the payload.

## Architecture Notes
- `useQRScanner` reads the live video stream, decodes QR frames, and validates JSON.
- `useAR` converts QR corners into a target pose; `MarkerARView` projects that pose into 3D.
- `PizzaModel` generates a full 3D pizza with toppings using Three.js primitives.
- `MarkerlessARView` uses WebXR hit-test when available, otherwise a 3D preview.

## Assets
No external 3D assets are required. The pizza is generated procedurally.
