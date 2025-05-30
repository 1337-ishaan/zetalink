import React from 'react';
import styled from 'styled-components/macro';

import Typography from '../utils/Typography';

const EmptyBalanceWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 32px;
  height: 100%;
  background: ${(props) => props.theme.colors.dark?.default};
  border-radius: ${(props) => props.theme.borderRadius};
  //   box-shadow: 0px 0px 21px 5px rgba(0, 0, 0, 0.1);
`;

const EmptyBalanceIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const EmptyBalance: React.FC = () => {
  return (
    <EmptyBalanceWrapper>
      <EmptyBalanceIcon>💼</EmptyBalanceIcon>
      <Typography size={24} weight={600}>
        No balance available
      </Typography>
      <br />
      <Typography size={16} weight={400}>
        Make sure you hold atleast<strong>1 ZETA or 0.0001 BTC</strong>
      </Typography>

      {/* <Typography size={16} weight={400}>
        All assets on the ZetaChain Network and Bitcoin Network (BTC) are displayed here ↓
      </Typography> */}
    </EmptyBalanceWrapper>
  );
};

export default EmptyBalance;
