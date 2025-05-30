import styled from 'styled-components/macro';

import { ReactComponent as ArrowIcon } from '../../assets/arrow.svg';

const ArrowWrapper = styled(ArrowIcon)<{ isReceived: boolean }>`
  transform: ${(props) => (props.isReceived ? 'rotateZ(180deg)' : 'unset')};
  height: 28px;
  padding: 4px;
  border-radius: 12px;
  width: 28px;
  z-index: -1;
  color: ${(props) => (props.isReceived ? '#008462' : '#ff4a3d')};
`;

type ArrowProps = {
  isReceived?: boolean;
  onClick?: (event: React.MouseEvent<SVGSVGElement>) => void;
  className?: string;
};

const Arrow = ({
  isReceived = false,
  onClick,
  className,
}: ArrowProps): JSX.Element => {
  return (
    <ArrowWrapper
      isReceived={isReceived}
      className={className}
      onClick={onClick}
    />
  );
};

export default Arrow;
