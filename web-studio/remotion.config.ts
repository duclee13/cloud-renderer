import { Config } from "@remotion/cli/config";

// Tối ưu Hybrid CPU + GPU Intel Iris Xe cho ASUS ZenBook UX425EA (8GB RAM)
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(90);
Config.setPixelFormat("yuv420p");
Config.setCodec("h264");
Config.setConcurrency(2);
Config.setChromiumOpenGlRenderer("angle");
Config.setHardwareAcceleration("if-possible");
Config.setX264Preset("veryfast");
