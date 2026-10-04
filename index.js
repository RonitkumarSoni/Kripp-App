// Compatibility for libraries using DOMException on native runtimes.
if (typeof globalThis.DOMException === "undefined") {
  globalThis.DOMException = class DOMException extends Error {
    constructor(message, name) {
      super(message);
      this.name = name || "DOMException";
    }
  };
}

// Load the app entry point.
import "expo-router/entry";
