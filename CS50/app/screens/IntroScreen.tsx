import React, { FunctionComponent, useContext } from 'react';
import { SafeAreaView, View } from 'react-native';
import styled, { ThemeContext } from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';
import i18n from 'common/i18n';

import ButtonWide, { ButtonWideVariant } from 'components/ButtonWide';
import Logo from 'components/Logo';

/**
 * IntroScreen B100
 */
const IntroScreen: FunctionComponent = () => {
  const theme = useContext(ThemeContext);

  return (
    <Container
      colors={[theme.palette.gradient.start, theme.palette.gradient.end]}
    >
      <SafeAreaView>
        <Wrapper>
          <View>
            <KataLogo />
            <TitleGroup>
              <Title>{i18n.t('screens.intro.title')}</Title>
              <SubTitle>{i18n.t('screens.intro.subTitle')}</SubTitle>
            </TitleGroup>
          </View>

          <ButtonGroup>
            <ButtonWide
              variant={ButtonWideVariant.WHITE}
              onPress={() => {
                if (__DEV__) console.info('Create Account button pressed');
              }}
            >
              {i18n.t('screens.intro.buttonAccount')}
            </ButtonWide>
            <ButtonWide
              variant={ButtonWideVariant.OUTLINED}
              onPress={() => {
                if (__DEV__) console.info('Sign in button pressed');
              }}
            >
              {i18n.t('screens.intro.buttonSignIn')}
            </ButtonWide>
          </ButtonGroup>
        </Wrapper>
      </SafeAreaView>
    </Container>
  );
};

const Container = styled(LinearGradient)<{ borderRadius?: number }>`
  flex: 1;
  padding: ${props => props.theme.paddingLarge};
`;

const Wrapper = styled.View`
  height: 100%;

  justify-content: space-around;
  align-items: center;
`;

const KataLogo = styled(Logo)`
  align-self: center;
  margin-bottom: 50px;
`;

const TitleGroup = styled.View`
  align-items: center;
`;

const Title = styled.Text`
  color: ${props => props.theme.palette.secondary};
  font-size: 22px;
  font-weight: ${props => props.theme.fontWeightHeavy};
  margin-bottom: 2px;
`;

const SubTitle = styled.Text`
  color: ${props => props.theme.palette.secondary};
  font-size: ${props => props.theme.fontSizeMedium};
  font-weight: ${props => props.theme.fontWeightLight};
`;

const ButtonGroup = styled.View`
  width: 100%;
  padding: 10px 0;
`;

export default IntroScreen;
