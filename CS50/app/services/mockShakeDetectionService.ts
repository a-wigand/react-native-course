class mockShakeDetectionService {

  constructor() {}

  /**
   * processVideoFrame
   * @param frameData object holding the focus area and reference grayscale information of a frame of video
   * @returns true if shaking is detected in the current video frame, false if not
   */
  public processVideoFrame(frameData: VideoFrameData): boolean {
    let prob = Math.random();
    const shakeProbability = 0.6;
    return prob < shakeProbability;
  }
}

export interface VideoFrameData {
  focusAreaGrayscale: number;
  referenceAreaGrayscale: number;
}
export default mockShakeDetectionService;
