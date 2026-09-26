import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setOverwriteOutput(true);
// H.264 CRF 16: a master that survives LinkedIn's re-encode without banding.
Config.setCodec('h264');
Config.setCrf(16);
Config.setPixelFormat('yuv420p');
// Tag output as Rec.709 so players and LinkedIn don't guess the colour range.
Config.setColorSpace('bt709');
