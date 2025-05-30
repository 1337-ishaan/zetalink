import React from 'react';
import styled from 'styled-components/macro';

const ToggleWrapper = styled.div`
  display: flex;
  background-color: #2c2c2c;
  border-radius: 20px;
  width: fit-content;
`;

const ToggleOption = styled.button<{ isActive: boolean }>`
  background-color: ${(props) => (props.isActive ? '#bfbfbf' : 'transparent')};
  color: ${(props) => (props.isActive ? '#1c1c1c' : '#a0a0a0')};
  border: none;
  border-radius: 16px;
  padding: 0px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    outline: none;
    border: none;

    background-color: ${(props) => (props.isActive ? '#bfbfbf' : '#4a4a4a')};
    color: ${(props) => (props.isActive ? '#fff' : '#ffffff')};
  }
`;

type ToggleProps = {
  isMainnet: boolean;
  onToggle: (option: boolean) => void;
};

const Toggle: React.FC<ToggleProps> = ({ isMainnet = false, onToggle }) => {
  return (
    <ToggleWrapper>
      <ToggleOption isActive={!isMainnet} onClick={() => onToggle(false)}>
        Testnet
      </ToggleOption>
      <ToggleOption isActive={isMainnet} onClick={() => onToggle(true)}>
        Mainnet
      </ToggleOption>
    </ToggleWrapper>
  );
};

export default Toggle;
