import React from 'react';
import styled, { keyframes } from 'styled-components';

import { ReactComponent as LoaderSVG } from '../../assets/logo.svg'; // Import your SVG file

// Define a keyframe animation
const rotate = keyframes`

  20% {
    transform: scale(0.9);
    opacity: 10%;

  }
  /* 40% {
    transform: scale(1);
    opacity: 100%;
  } */
  80% {
    transform: scale(1.1);
    opacity: 100%;
  }
`;

// Create a Styled Component for the loader
const LoaderWrapper = styled.div`
  width: 200px; /* Adjust size as needed */
  height: 100px; /* Adjust size as needed */
  animation: ${rotate} 1.2s linear infinite; /* Apply animation */
  display: flex;
  column-gap: 16px;
  justify-content: center;
  margin: auto;
  transition: all 0.4s;
`;

// React component
const Loader = () => {
  return (
    <LoaderWrapper>
      <LoaderSVG className="loader-svg" />
      <LoaderSVG className="loader-svg" />
      <LoaderSVG className="loader-svg" />
    </LoaderWrapper>
  );
};

export default Loader;
