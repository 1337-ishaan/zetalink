import 'rc-tooltip/assets/bootstrap_white.css';

import Tooltip from 'rc-tooltip';
import React from 'react';
import styled from 'styled-components/macro';

import FlexRowWrapper from './wrappers/FlexRowWrapper';
import { ReactComponent as InfoIcon } from '../../assets/info.svg';

const TooltipInfoWrapper = styled(Tooltip)`
  width: fit-content;
`;

type TooltipInfoProps = {
  children: React.ReactNode;
  placement?: string;
};

const TooltipInfo = ({
  children,
  placement = 'top',
}: TooltipInfoProps): JSX.Element => {
  return (
    <TooltipInfoWrapper
      //   visible
      showArrow={false}
      placement={placement}
      overlayInnerStyle={{
        background: 'rgba(0, 132, 98,1)',
        border: 'none',
        color: '#fff',
      }}
      overlay={<span>{children}</span>}
    >
      <FlexRowWrapper>
        <InfoIcon height={24} width={24} color="#ffffff" />
      </FlexRowWrapper>
    </TooltipInfoWrapper>
  );
};

export default TooltipInfo;
