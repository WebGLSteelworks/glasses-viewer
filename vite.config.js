import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      'three/nodes': path.resolve('./node_modules/three/examples/jsm/nodes/Nodes.js')
    }
  }
});