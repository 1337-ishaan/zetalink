import styled from 'styled-components/macro';

import { ReactComponent as InfoIcon } from '../../assets/info.svg';

const InfoBoxWrapper = styled.div<{ color?: string }>`
  padding: 8px;
  background: ${(props) =>
    props.color ? props.color : 'rgba(255, 255, 0, 0.3)'};
  border-radius: ${(props) => props.theme.borderRadius};
  display: flex;
  align-items: center;
  column-gap: 8px;
  font-size: 14px;
  color: #eee;
  width: fit-content;

  .info-icon {
    max-width: 24px;
    max-height: 24px;
  }
`;

type InfoBoxProps = {
  children: JSX.Element | string;
  color?: string;
};

const InfoBox = ({ children, color }: InfoBoxProps): JSX.Element => {
  return (
    <InfoBoxWrapper color={color ?? ''}>
      <InfoIcon className="info-icon" />
      {children}
    </InfoBoxWrapper>
  );
};

export default InfoBox;
