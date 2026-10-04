import type { NextConfig } from 'next';
import path from 'node:path';

const config: NextConfig = {
  transpilePackages: ['@white-label/core'],
  outputFileTracingRoot: path.resolve(__dirname, '..'),
  devIndicators: false,
};
export default config;
