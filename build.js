require('esbuild').buildSync({
  entryPoints: ['popup.js'],   // your main JS file
  bundle: true,
  outfile: 'dist/popup.bundle.js',
  minify: true,
});