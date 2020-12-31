class mockAudioAnalysisService {
  private spikeCount: number;

  constructor() {
    this.spikeCount = 0;
  }

  /**
   * processAudioSample
   * @param signal The audio sample to process - should be in the raw string format
   */
  public processAudioSample(signal: string) : void {
    console.log(`processed audio sample: ${signal}`)
  }

  /**
   * processReferenceSample
   * @param bufferedSignal The buffered audio sample to process - should be an array of samples stored as strings (the format given by the microphone)
   */
  public processReferenceSample(bufferedSignal: Array<string>): void {
    console.log(`processed audio sample: ${bufferedSignal}`)
  }

  /**
   * getDecibelLevel
   * @returns the loudness of the most recently processed audio sample in db
   */
  public getDecibelLevel(): number {
    const currentMs = new Date().getMilliseconds();
    const maxDb = 10;
    const spikeDb = 2 * maxDb;
    const spikeProb = 0.025;
    let percentDone: number;

    // Simulate random decibel spikes 3-4 frames of very high decibel readings
    const spikeTrigger = Math.random();
    if (this.spikeCount > 0) {
      this.spikeCount--;
      return spikeDb;
    }
    if (spikeTrigger < spikeProb) {
      this.spikeCount = 2;
      return spikeDb;
    }

    // if we are not currently in a spike return a value oscilating between 0-10 every second
    if (currentMs < 500) {
       percentDone = currentMs / 500;
    } else {
       percentDone = 1 - (currentMs - 500) / 500;
    }
    const currentDb = percentDone * maxDb;
    return currentDb;
  }

  /**
   * getSprayDetected
   * @returns whether or not a spray has been detected in the current phase
   */
  public getSprayDetected(): boolean {
    return false;
  }

  /**
   * getSprayTiming
   * @returns offset in MS of spray timing relative to the start of the inhalation.
   * returns negative numbers if the spray is detected prior to the start of the inhalation,
   * positive numbers if the spray is detected after the start of the inhalation.
   */
  public getSprayTiming(): number {
    return 100;
  }

  /**
   * getDuration
   * @param phase the phase of the trainer for which you want to fetch the measured duration
   * @returns number - the duration of the requested phase in ms
   */
  public getDuration(phase: trainerPhase): number {
    return 1000;
  }
}

export enum trainerPhase {
  inhalation,
  exhalation,
  holdBreath,
}

export default mockAudioAnalysisService;
