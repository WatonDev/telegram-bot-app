import React from "react";
import styled from "styled-components";

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #121212;
  color: #fff;
  font-size: 24px;
`;

const LoadingScreen = () => {
  console.log("Loading application...");
  return <LoadingWrapper>Loading...</LoadingWrapper>;
};

export default LoadingScreen;