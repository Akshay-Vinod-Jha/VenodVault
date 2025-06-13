// components/BotpressChatbot.js
import React, { useEffect } from "react";

const BotpressChatbot = () => {
  useEffect(() => {
    // Function to load external scripts dynamically
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        // Check if script is already loaded
        const existingScript = document.querySelector(`script[src="${src}"]`);
        if (existingScript) {
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = src;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () =>
          reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(script);
      });
    };

    // Load Botpress scripts in sequence
    const initializeBotpress = async () => {
      try {
        // Load the main Botpress webchat script first
        await loadScript("https://cdn.botpress.cloud/webchat/v3.0/inject.js");

        // Then load the configuration script
        await loadScript(
          "https://files.bpcontent.cloud/2025/06/12/21/20250612213910-SBWVHLU2.js"
        );

        console.log("Botpress chatbot loaded successfully");
      } catch (error) {
        console.error("Failed to load Botpress chatbot:", error);
      }
    };

    initializeBotpress();

    // Cleanup function (optional)
    return () => {
      // You might want to clean up event listeners or other resources here
      // Note: Removing the chatbot scripts entirely might not be necessary
      // as the chatbot should persist across page navigation
    };
  }, []);

  // This component doesn't render any visible content
  // The chatbot widget will be injected by the Botpress scripts
  return null;
};

export default BotpressChatbot;
