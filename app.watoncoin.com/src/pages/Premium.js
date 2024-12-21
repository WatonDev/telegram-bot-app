import React from "react";
import MenuBar from "../components/MenuBar";

const Premium = () => {
  const handleWalletConnect = () => {
    window.open("https://tonkeeper.com/", "_blank"); // Link do Tonkeeper
  };

  return (
    <div className="page-container">
      <h1>Premium Membership</h1>
      <img
        src="https://i.imgur.com/rqjZs7B.png"
        alt="Premium Icon"
        style={{ width: "150px", margin: "20px auto" }}
      />
      <p>Connect your wallet to unlock Premium features!</p>
      <button className="button-primary" onClick={handleWalletConnect}>
        Connect Wallet
      </button>
      <MenuBar />
    </div>
  );
};

export default Premium;
