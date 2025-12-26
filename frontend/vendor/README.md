Vendor Mediapipe files

This directory is the target for Mediapipe JS/WASM files that must be served from the same origin.

Recommended workflow (from repo root):

1) Run the helper script (PowerShell):

   pwsh .\scripts\vendor_mediapipe.ps1

This installs the packages temporarily and copies the necessary files into `frontend/vendor/mediapipe`.

2) Commit `frontend/vendor/mediapipe` to your repository and deploy to Vercel.

Notes:
- Serving the JS and WASM files from your site avoids browser Tracking Prevention blocking third-party storage and reduces CORS/packed-asset issues.
- If you want SIMD performance, vendor the SIMD build files from the package and include a non-SIMD fallback for broader browser support.
- After running the script, verify `loafing.html` loads `vendor/mediapipe/face_mesh.js` and that `loafing.js` uses `locateFile` to resolve wasm and packed assets from `vendor/mediapipe`.
