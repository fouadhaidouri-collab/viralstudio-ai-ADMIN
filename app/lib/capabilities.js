export const USD_TO_CREDIT = 1000 / 29;

export const videoAspectRatios = [
  { label: "Cinematic 16:9", icon: "crop_16_9" },
  { label: "Instagram 9:16", icon: "crop_portrait" },
  { label: "Square 1:1", icon: "crop_square" },
  { label: "Portrait 4:5", icon: "crop_7_5" },
];

export const videoResolutions = ["720p", "1080p"];
export const videoDurations = ["5 seconds", "8 seconds", "10 seconds", "15 seconds"];

export const videoModelCapabilities = {
  "Veo 3.1 Fast": {
    aspectRatios: ["Cinematic 16:9", "Instagram 9:16", "Square 1:1", "Portrait 4:5"],
    resolutions: ["720p", "1080p"],
    durations: ["5 seconds", "8 seconds", "10 seconds", "15 seconds"],
  },
  "Grok Imagine Video": {
    aspectRatios: ["Cinematic 16:9", "Instagram 9:16", "Square 1:1", "Portrait 4:5"],
    resolutions: ["720p", "1080p"],
    durations: ["5 seconds", "8 seconds", "10 seconds", "15 seconds"],
  },
  "SeeDance 1.5": {
    aspectRatios: ["Cinematic 16:9", "Instagram 9:16", "Square 1:1", "Portrait 4:5"],
    resolutions: ["720p", "1080p"],
    durations: ["5 seconds"],
  },
  "SeeDance 2.0": {
    aspectRatios: ["Cinematic 16:9", "Instagram 9:16", "Square 1:1", "Portrait 4:5"],
    resolutions: ["720p", "1080p"],
    durations: ["5 seconds"],
  },
  "Kling 3.0": {
    aspectRatios: ["Cinematic 16:9", "Instagram 9:16", "Square 1:1", "Portrait 4:5"],
    resolutions: ["720p", "1080p"],
    durations: ["5 seconds"],
  },
  "Runway Gen 4.5": {
    aspectRatios: [],
    resolutions: ["720p", "1080p"],
    durations: ["5 seconds", "8 seconds", "10 seconds", "15 seconds"],
  },
  "Luma Ray 2": {
    aspectRatios: ["Cinematic 16:9", "Instagram 9:16", "Square 1:1", "Portrait 4:5"],
    resolutions: ["720p", "1080p"],
    durations: ["5 seconds", "8 seconds", "10 seconds", "15 seconds"],
  },
  "Pika 2.1": {
    aspectRatios: ["Cinematic 16:9", "Instagram 9:16", "Square 1:1", "Portrait 4:5"],
    resolutions: ["720p", "1080p"],
    durations: ["5 seconds", "8 seconds", "10 seconds", "15 seconds"],
  },
  "Happy Horse": {
    aspectRatios: ["Cinematic 16:9", "Instagram 9:16", "Square 1:1", "Portrait 4:5"],
    resolutions: ["720p", "1080p"],
    durations: ["5 seconds"],
  },
};

export const imageAspectRatios = [
  { label: "Square 1:1", icon: "crop_square" },
  { label: "Portrait 4:5", icon: "crop_7_5" },
  { label: "Landscape 16:9", icon: "crop_16_9" },
  { label: "Portrait 9:16", icon: "crop_portrait" },
];

export const imageResolutions = ["720p", "1080p"];

const ALL_IMAGE_ARS = ["Square 1:1", "Portrait 4:5", "Landscape 16:9", "Portrait 9:16"];

export const imageModelCapabilities = {
  "GPT Image 2": { aspectRatios: ALL_IMAGE_ARS, resolutions: ["720p", "1080p"] },
  "NanoBanana 2": { aspectRatios: ALL_IMAGE_ARS, resolutions: ["720p", "1080p"] },
  "NanoBanana Pro": { aspectRatios: ALL_IMAGE_ARS, resolutions: ["720p", "1080p"] },
  "NanoBanana": { aspectRatios: ALL_IMAGE_ARS, resolutions: ["720p", "1080p"] },
  "Imagen 4": { aspectRatios: ALL_IMAGE_ARS, resolutions: ["720p", "1080p"] },
  "Grok": { aspectRatios: ALL_IMAGE_ARS, resolutions: ["720p", "1080p"] },
};
