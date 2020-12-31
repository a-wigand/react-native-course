import FirCoeffs from './dsp/firCoefs';
import FirFilter from './dsp/firFilter';
import { Buffer } from 'buffer';

class audioAnalysisService {
  highPassFirFilter;
  lowPassFirFilter;

  private referenceRMS = 50;
  private lowPassReferenceRMS = 50;
  private highPassReferenceRMS = 50;
  private inhalationThreshold = 10;
  private sprayThreshold = 50;

  private currentSPL = 0;
  private currentLpSPL = 0;
  private currentHpSPL = 0;
  private sprayDetected = false;
  private isInhaling = false;
  private currentTimestamp = new Date();

  private canDetectInhalation = false;
  private stepStartTimestamp = new Date();
  private frameSummaryQueueSize = 5;
  private frameSummaryQueue = new Array<frameSummary>();
  private audioEventTimeoutDuration = 1500;
  private audioEventStack = new Array<audioEvent>();

  constructor() {
    const firCalculator = FirCoeffs();
    const highPassFirFilterCoeffs = firCalculator.highpass({
      order: 10,
      Fs: 44100,
      Fc: 15000,
    });
    const lowPassFirFilterCoeffs = firCalculator.lowpass({
      order: 10,
      Fs: 44100,
      Fc: 7000,
    });
    this.lowPassFirFilter = FirFilter(lowPassFirFilterCoeffs);
    this.highPassFirFilter = FirFilter(highPassFirFilterCoeffs);
  }

  /**
   * reset
   * reset the internal buffers. should be called before each new phase of the inhalation trainer
   */
  public reset(): void {
    this.frameSummaryQueue = new Array<frameSummary>();
    this.audioEventStack = new Array<audioEvent>();
    this.sprayDetected = false;
    this.stepStartTimestamp = new Date();
    this.canDetectInhalation = false;
  }

  /**
   * processAudioSample
   * @param signal The audio sample to process - should be in the raw string format
   */
  public processAudioSample(signal: string): void {
    this.currentTimestamp = new Date();

    this.calculateSoundPressureLevel(signal);
    this.checkForInhalation();
    if (!this.sprayDetected) {
      this.checkForSpray();
    }
    const thisFrameSummary: frameSummary = {
      spl: this.currentSPL,
      hpspl: this.currentHpSPL,
      lpspl: this.currentLpSPL,
      isInhaling: this.isInhaling,
      isSpraying: this.sprayDetected,
      timestamp: this.currentTimestamp,
    };
    this.saveFrameSummary(thisFrameSummary);
  }

  /**
   * processReferenceSample
   * @param bufferedSignal The buffered audio sample to process - should be an array of samples stored as strings (the format given by the microphone)
   */
  public processReferenceSample(bufferedSignal: Array<string>): void {
    let sumRMS = 0;
    let sumLpRMS = 0;
    let sumHpRMS = 0;
    bufferedSignal.forEach(signal => {
      const buffer = Buffer.from(signal, 'base64');
      const bufferFloats = this.toFloat16Array(buffer);
      sumRMS += this.rootMeanSquare(bufferFloats);

      const lpSignal = this.filterLowPass(bufferFloats);
      sumLpRMS += this.rootMeanSquare(lpSignal);

      const hpSignal = this.filterHighPass(bufferFloats);

      sumHpRMS += this.rootMeanSquare(hpSignal);
    });

    // calculate mean rms of all signals
    this.referenceRMS = sumRMS / bufferedSignal.length;
    this.lowPassReferenceRMS = sumLpRMS / bufferedSignal.length;
    this.highPassReferenceRMS = sumHpRMS / bufferedSignal.length;
  }

  /**
   * getDecibelLevel
   * @returns the loudness of the most recently processed audio sample in db
   */
  public getDecibelLevel(): number {
    return this.currentSPL;
  }

  /**
   * getSprayDetected
   * @returns whether or not a spray has been detected in the current phase
   */
  public getSprayDetected(): boolean {
    return this.sprayDetected;
  }

  /**
   * getSprayTiming
   * @returns offset in MS of spray timing relative to the start of the inhalation.
   * should only be called if an inhalation duration is available and a spray has been detected.
   * returns negative numbers if the spray is detected prior to the start of the inhalation,
   * positive numbers if the spray is detected after the start of the inhalation.
   */
  public getSprayTiming(): number {
    // get inhalation start from earlier record on the stack if available
    // get local copy of the event stack
    const eventStack = [...this.audioEventStack];
    for (let i = 0; i < eventStack.length; i++) {
      const currentEvent = eventStack[i];
      if (currentEvent.eventType === audioEventType.spray) {
        const sprayTime = currentEvent.timestamp.getTime();
        let inhalationStartTime: number;

        // the spray event is the oldest one in the stack
        // the inhalation timing is too late in this case
        // return -1 because the spray happended too early
        if (i === 0) {
          return -1;
        }

        // now we can assume that there is a previous inhalation event
        const priorEvent = eventStack[i - 1];
        if (priorEvent.eventType === audioEventType.inhalationStart) {
          // we are in the middle of an inhalation
          inhalationStartTime = priorEvent.timestamp.getTime();
        } else {
          // we can assume that the event before the prior event is the start of an inhalation
          inhalationStartTime = eventStack[i - 2].timestamp.getTime();
        }
        return sprayTime - inhalationStartTime;
      }
    }
    throw new Error('no spray detected');
  }

  /**
   * getDuration
   * @param phase the phase of the trainer for which you want to fetch the measured duration
   * @returns number - the duration of the requested phase in ms
   */
  public getDuration(phase: trainerPhase): number {
    // Trim the audiostack in cases of inhalation
    if (phase == trainerPhase.holdBreath) {
      return this.getBreathHoldDuration();
    } else if (phase == trainerPhase.inhalation) {
      this.checkForAudioEventTimeout();
    }

    // Filter out sprays
    const eventStack = [...this.audioEventStack].filter(e => {
      return e.eventType !== audioEventType.spray;
    });
    if (eventStack.length < 1) {
      return 0;
    }

    let duration = 0;

    // Check for edge case where the user is in the middle of an inhalation
    const finalEvent = eventStack.pop();
    if (finalEvent?.eventType == audioEventType.inhalationStart) {
      duration +=
        this.currentTimestamp.getTime() - finalEvent?.timestamp.getTime();
    }

    // Iterate back to front through audiostack, increment duration when we detect a matching start/end event pair
    let previousEvent = finalEvent;
    let currentEvent = eventStack.pop();
    while (currentEvent) {
      if (
        previousEvent &&
        currentEvent.eventType == audioEventType.inhalationStart
      ) {
        duration +=
          previousEvent.timestamp.getTime() - currentEvent.timestamp.getTime();
      }
      previousEvent = currentEvent;
      currentEvent = eventStack.pop();
    }

    return duration;
  }

  private getBreathHoldDuration(): number {
    // Filter out sprays
    const eventStack = [...this.audioEventStack].filter(e => {
      return e.eventType !== audioEventType.spray;
    });

    if (!this.canDetectInhalation) {
      return 0;
    }

    const stepStartWithInhalation =
      eventStack.length > 0
        ? eventStack[0].timestamp.getTime() -
            this.stepStartTimestamp.getTime() <
          200
        : false;

    let holdBreathEnd: Date;

    if (!stepStartWithInhalation) {
      // When we start with silence, the breath hold is measured from the start of the step until
      // either the start of the first inhalation, or the current timestamp
      holdBreathEnd =
        eventStack.length > 0 ? eventStack[0].timestamp : this.currentTimestamp;
      return holdBreathEnd.getTime() - this.stepStartTimestamp.getTime();
    } else {
      // when we start with inhalation, the breath hold is measured from the end of the first inhalation
      // until either the start of the second inhalation, or the current timestamp
      holdBreathEnd =
        eventStack.length > 2 ? eventStack[2].timestamp : this.currentTimestamp;
      return eventStack.length > 1
        ? holdBreathEnd.getTime() - eventStack[1].timestamp.getTime()
        : 0;
    }
  }

  private calculateSoundPressureLevel(signal: string): void {
    const bufferedSignal = Buffer.from(signal, 'base64');

    const f16Array = this.toFloat16Array(bufferedSignal);

    const originalRMS = this.rootMeanSquare(f16Array);

    const lpBufferedSignal = this.filterLowPass(f16Array);
    const lowPassRMS = this.rootMeanSquare(lpBufferedSignal);

    const hpBufferedSignal = this.filterHighPass(f16Array);
    const highPassRMS = this.rootMeanSquare(hpBufferedSignal);

    const originalSPL = this.soundPressureLevel(originalRMS, this.referenceRMS);
    const lowPassSPL = this.soundPressureLevel(
      lowPassRMS,
      this.lowPassReferenceRMS
    );
    const highPassSPL = this.soundPressureLevel(
      highPassRMS,
      this.highPassReferenceRMS
    );

    this.currentLpSPL = lowPassSPL;
    this.currentHpSPL = highPassSPL;
    this.currentSPL = originalSPL;
  }

  private checkForSpray() {
    if (this.currentHpSPL > this.sprayThreshold) {
      this.sprayDetected = true;
      const sprayTimeStamp = this.currentTimestamp;
      const sprayEvent: audioEvent = {
        timestamp: sprayTimeStamp,
        eventType: audioEventType.spray,
      };
      const latestEvent = this.audioEventStack[this.audioEventStack.length - 1];
      if (latestEvent?.eventType !== audioEventType.spray) {
        this.audioEventStack.push(sprayEvent);
      }
    }
  }

  private checkForInhalation(): void {
    const inhalationStartEventCount = this.audioEventStack.filter(
      event => event.eventType === audioEventType.inhalationStart
    ).length;
    const inhalationEndEventCount = this.audioEventStack.filter(
      event => event.eventType === audioEventType.inhalationStop
    ).length;
    if (this.currentLpSPL > this.inhalationThreshold) {
      this.isInhaling = true;

      if (
        this.isInhalationConfirmed() &&
        inhalationEndEventCount === inhalationStartEventCount
      ) {
        const inhalationStartTimeStamp = this.frameSummaryQueue[0].timestamp;
        const inhalationStartEvent: audioEvent = {
          timestamp: inhalationStartTimeStamp,
          eventType: audioEventType.inhalationStart,
        };
        this.audioEventStack.push(inhalationStartEvent);
      }
    } else {
      this.isInhaling = false;
      if (
        !this.isInhalationConfirmed() &&
        inhalationEndEventCount < inhalationStartEventCount
      ) {
        const inhalationStopTimeStamp = this.currentTimestamp;
        const inhalationStopEvent: audioEvent = {
          timestamp: inhalationStopTimeStamp,
          eventType: audioEventType.inhalationStop,
        };
        this.audioEventStack.push(inhalationStopEvent);
      }
    }
  }

  private isInhalationConfirmed() {
    this.canDetectInhalation =
      this.frameSummaryQueue.length == this.frameSummaryQueueSize;
    if (!this.canDetectInhalation) {
      return false;
    }
    const framesWithInhaling = this.frameSummaryQueue.filter(
      summary => summary.isInhaling
    ).length;
    const inhalationConfirmed =
      framesWithInhaling / this.frameSummaryQueue.length > 0.5;

    return inhalationConfirmed;
  }

  private saveFrameSummary(summary: frameSummary): void {
    this.frameSummaryQueue.push(summary);
    if (this.frameSummaryQueue.length > this.frameSummaryQueueSize) {
      this.frameSummaryQueue.shift();
    }
  }

  private filterHighPass(bufferedSignal: Array<number>): Array<number> {
    return this.highPassFirFilter.multiStep(bufferedSignal);
  }

  private filterLowPass(bufferedSignal: Array<number>): Array<number> {
    return this.lowPassFirFilter.multiStep(bufferedSignal);
  }

  private toFloat16Array(inputBuffer: Buffer): Array<number> {
    const i16Array = new Int16Array(inputBuffer.buffer);

    const outputBufferLength = inputBuffer.length / 2;
    const outputBuffer = new Array<number>(outputBufferLength);

    for (let i = 0; i < outputBufferLength; i++) {
      outputBuffer[i] = i16Array[i] / 32767;
    }
    return outputBuffer;
  }

  private checkForAudioEventTimeout() {
    if (!this.sprayDetected && this.audioEventStack.length > 1) {
      const currentTimeDifferential =
        this.currentTimestamp.getTime() -
        this.audioEventStack[1].timestamp.getTime();
      if (currentTimeDifferential > this.audioEventTimeoutDuration) {
        this.audioEventStack.shift();
        this.audioEventStack.shift();
        this.checkForAudioEventTimeout();
      }
    }
  }

  private rootMeanSquare(signal: Array<number>): number {
    //square every value
    const signalParsed = signal.filter(val => {
      return !Number.isNaN(val);
    });

    const signalSquared = signalParsed.map(value => {
      return value * value;
    });

    //sum the array
    const signalSum = signalSquared.reduce((total, current) => {
      return total + current;
    });

    //take take the mean
    const signalMean = signalSum / signalSquared.length;
    return signalMean;
  }

  private soundPressureLevel(sample: number, reference: number): number {
    const spl = 20 * Math.log10(sample / reference);
    return spl;
  }
}

interface frameSummary {
  spl: number;
  hpspl: number;
  lpspl: number;
  isInhaling: boolean;
  isSpraying: boolean;
  timestamp: Date;
}

interface audioEvent {
  eventType: audioEventType;
  timestamp: Date;
}

enum audioEventType {
  inhalationStart,
  inhalationStop,
  spray,
}

export enum trainerPhase {
  inhalation,
  exhalation,
  holdBreath,
}

export default audioAnalysisService;
