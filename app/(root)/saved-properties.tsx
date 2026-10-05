import React from "react";
import SavedScreen from "./(tabs)/saved";

export default function SavedPropertiesStackScreen() {
  // We reuse the exact same screen logic from the tab, but render it as a stack screen!
  // The 'fromProfile=true' param is already handled inside the component.
  return <SavedScreen />;
}
