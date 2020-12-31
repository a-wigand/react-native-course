import React, { FunctionComponent, ReactText } from 'react';
import { Text } from 'react-native';
import styled from 'styled-components/native';

type ButtonWidePropsT = {
  children: ReactText;
  variant?: ButtonWideVariant;
  onPress: (event: Event) => void;
};

export enum ButtonWideVariant {
  OUTLINED,
  WHITE,
}

const Button: FunctionComponent<ButtonWidePropsT> = ({
  children,
  variant = ButtonWideVariant.WHITE,
  onPress,
}) => (
  <Text>{children}</Text>
  // <Wrapper variant={variant} onPress={onPress}>
    // <Title variant={variant}>{children}</Title>
  // </Wrapper>
);

// const Wrapper = styled.TouchableOpacity<Pick<ButtonWidePropsT, 'variant'>>`
//   ${props => {
//     switch (props.variant) {
//       case ButtonWideVariant.OUTLINED:
//         return `
//           background-color: transparent;
//         `;
//       case ButtonWideVariant.WHITE:
//       default:
//         return `
//           background-color: ${props.theme.palette.secondary};
//         `;
//     }
//   }}

//   /* Layout */
//   padding: ${props => props.theme.paddingMedium} 0;
//   margin: ${props => props.theme.marginMedium} 0;

//   /* Border */
//   border: ${props => `1px solid ${props.theme.palette.secondary}`};
//   border-radius: ${props => props.theme.borderRadiusMedium};

//   /* children */
//   align-items: center;
// `;

// const Title = styled.Text<Pick<ButtonWidePropsT, 'variant'>>`
//   ${props => {
//     switch (props.variant) {
//       case ButtonWideVariant.OUTLINED:
//         return `
//             color: ${props.theme.palette.secondary};
//           `;
//       case ButtonWideVariant.WHITE:
//       default:
//         return `
//             color: ${props.theme.palette.primary};
//           `;
//     }
//   }}

//   /* Font */
//   font-weight: ${props => props.theme.fontWeightMedium};
//   font-size: ${props => props.theme.fontSizeMedium};
// `;

export default Button;
