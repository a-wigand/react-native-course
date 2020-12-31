// External imports
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import AudioRecord from 'react-native-audio-record';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import Permissions from 'react-native-permissions';
import ButtonWide, { ButtonWideVariant } from '../components/ButtonWide';
import audioAnalysisService, {
  trainerPhase,
} from '../services/audioAnalysisService';
import { black, colorPrimary, white } from '../common/styles/colors';
import mockAudioAnalysisService from '../services/mockAudioAnalysisService';
import Button from '../components/ButtonWide';

const aas: audioAnalysisService = new audioAnalysisService();
const SoundTestScreen = () => {
  useEffect(() => {
    requestPermissions();
    initAudioRecord();
  });
  const [dblevel, setDbLevel] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(trainerPhase.inhalation);
  let signalBuffer: Array<string>;
  const initAudioRecord = () => {
    const options = {
      sampleRate: 44100, // default 44100
      channels: 1, // 1 or 2, default 1
      bitsPerSample: 16, // 8 or 16, default 16
      audioSource: 6, // android only
      wavFile: 'test.wav', // default 'audio.wav'
    };
    AudioRecord.init(options);
  };

  const onDataRecorded = (data: string) => {
    aas.processAudioSample(data);
    const currentDbLevel = aas.getDecibelLevel();
    const sprayDetected = aas.getSprayDetected();
    const phaseDuration = aas.getDuration(currentPhase);
    let sprayTiming = 0;
    if (sprayDetected) {
      sprayTiming = aas.getSprayTiming();
    }
    // FIXME: There is a bug related to the state management of dblevel.
    // Setting the dblevel to a fixed value or phaseDuration for example works fine. However, setting it to currentDbLevel seems to break the audio stream. only one "package" of audio data gets processed in this scenario.
    // setDbLevel(dblevel);
    console.log(
      `
      Phase: ${currentPhase} [0:inhalation 1:exhalation 2:holdBreath]
      Phase Duration: ${phaseDuration} 
      ${
        currentPhase == trainerPhase.inhalation
          ? ''
          : '//not relevant, ignore this line '
      }Spray: ${sprayDetected ? 'true ' : 'false '}${
        sprayDetected ? 'Spray Timing: ' : ''
      }${sprayDetected ? sprayTiming : ''} 
      dB Level: ${currentDbLevel > 0 ? currentDbLevel.toFixed(2) : 0}`
    );
  };

  const startRecording = () => {
    aas.reset();
    AudioRecord.on('data', data => {
      onDataRecorded(data);
    });
    AudioRecord.start();
  };

  const stopRecording = () => {
    AudioRecord.stop();
  };

  const startRecordReference = () => {
    signalBuffer = new Array<string>();
    AudioRecord.on('data', data => {
      signalBuffer.push(data);
    });
    AudioRecord.start();
    console.log('recording refercence audio ...');
  };

  const stopRecordReference = () => {
    stopRecording();
    aas.processReferenceSample(signalBuffer);
    signalBuffer = new Array<string>();
    console.log('recording refercence audio complete');
  };

  return (
    <SafeAreaView>
      {/* <Wrapper> */}
        <Text>SoundTest Screen</Text>
        <Text>dB Level: {dblevel}</Text>
        <View style={{ alignItems: 'center' }}>
          <View
            style={{
              width: dblevel * 10,
              height: 15,
              backgroundColor: colorPrimary,
            }}
          />
          <View
            style={{
              width: dblevel * 20,
              height: 30,
              backgroundColor: colorPrimary,
            }}
          />
          <View
            style={{
              width: dblevel * 10,
              height: 15,
              backgroundColor: colorPrimary,
            }}
          />
        </View>
        {/* <ButtonGroup> */}
          <Pressable
            style={{
              width: 180,
              height: 50,
              borderRadius: 20,
              backgroundColor: white,
              alignSelf: 'center',
              alignItems: 'center',
              justifyContent: 'space-around',
            }}
            onPressIn={() => startRecordReference()}
            onPressOut={() => stopRecordReference()}
          >
            <Text style={{ color: colorPrimary, fontWeight: 'bold' }}>
              Record Reference
            </Text>
          </Pressable>
          <Button onPress={() => startRecording()}>Start</Button>
          <Button onPress={() => stopRecording()}>Stop</Button>
        {/* </ButtonGroup> */}
      {/* </Wrapper> */}
    </SafeAreaView>
  );
};

const requestPermissions = async () => {
  const p = await Permissions.check('ios.permission.MICROPHONE');
  if (p === 'granted') return;
  return requestPermission();
};

const requestPermission = async () => {
  const p = await Permissions.request('ios.permission.MICROPHONE');
};

export default SoundTestScreen;
