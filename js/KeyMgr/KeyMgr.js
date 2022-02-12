const areArraysEqual = (a, b) => {
      const isLengthEqual = a.length === b.length;
      if (!isLengthEqual) {
            return false;
      }

      for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) {
                  return false;
            }
      }

      return true;
};

const KeyHelper = class {
      static keyCodeMap = {
            0: "Digit0",
            1: "Digit1",
            2: "Digit2",
            3: "Digit3",
            4: "Digit4",
            5: "Digit5",
            6: "Digit6",
            7: "Digit7",
            8: "Digit8",
            9: "Digit9",
            '"': "Quote",
            ",": "Comma",
            ".": "Period",
            "/": "Slash",
            ";": "Semicolon",
            A: "KeyA",
            Alt: "AltRight",
            AltLeft: "AltLeft",
            AltRight: "AltRight",
            B: "KeyB",
            C: "KeyC",
            CapsLock: "CapsLock",
            Ctrl: "ControlRight",
            CtrlLeft: "ControlLeft",
            CtrlRight: "ControlRight",
            D: "KeyD",
            E: "KeyE",
            Enter: "Enter",
            Esc: "Escape",
            F: "KeyF",
            G: "KeyG",
            H: "KeyH",
            I: "KeyI",
            J: "KeyJ",
            K: "KeyK",
            L: "KeyL",
            M: "KeyM",
            N: "KeyN",
            O: "KeyO",
            P: "KeyP",
            Q: "KeyQ",
            R: "KeyR",
            S: "KeyS",
            Shift: "ShiftRight",
            T: "KeyT",
            Tab: "Tab",
            U: "KeyU",
            V: "KeyV",
            W: "KeyW",
            X: "KeyX",
            Y: "KeyY",
            Z: "KeyZ",
            "[": "BracketLeft",
            "\\": "Backslash",
            "]": "BracketRight",
      };

      static convertKeyCodeToKey = (keyCode) => {
            return this.keyCodeMap[keyCode] || keyCode;
      };
};

const KeyCombo = class {
      static areKeyCombosEqual = (keyCombo1, keyCombo2) => {
            if (!areArraysEqual(keyCombo1.keyArray, keyCombo2.keyArray)) {
                  return false;
            }
            if (keyCombo1.callback !== keyCombo2.callback) {
                  return false;
            }
            if (keyCombo1.orderSensitive !== keyCombo2.orderSensitive) {
                  return false;
            }

            return true;
      };

      constructor(keyArray, callback, orderSensitive = false) {
            this.keyArray = keyArray;
            this.callback = callback;
            this.orderSensitive = orderSensitive;
      }
};

const KeyMgr = class {
      isKeyPressed = (key) => {
            return this.keysPressed.includes(key);
      };

      checkForCombo = (newKeyPressKeyCode) => {
            let foundCombo = false;
            this.keyCombos.forEach((keyCombo) => {
                  if (!keyCombo) {
                        return;
                  }

                  let includesAll = true;

                  let keySetArray = keyCombo.keyArray;

                  if (!keySetArray.includes(newKeyPressKeyCode)) {
                        return;
                  }

                  let keysPressedArrayCopy = this.keysPressed || [];

                  keySetArray.forEach((key) => {
                        if (!this.isKeyPressed(key)) {
                              includesAll = false;
                        }
                  });
                  if (includesAll) {
                        const keyArrayCopyFiltered =
                              keysPressedArrayCopy.filter((elem) => {
                                    return keySetArray.includes(elem);
                              });
                        const wasPressedInOrder = areArraysEqual(
                              keyArrayCopyFiltered,
                              keySetArray
                        );
                        if (wasPressedInOrder) {
                              return keyCombo.callback();
                        }
                        if (!keyCombo.orderSensitive) {
                              return keyCombo.callback();
                        }
                        return;
                  }
            });
            return foundCombo;
      };

      addKeyCombo = (keyComboObject) => {
            let isThereAlready = false;
            this.keyCombos.forEach((combo) => {
                  if (KeyCombo.areKeyCombosEqual(combo, keyComboObject)) {
                        isThereAlready = true;
                  }
            });
            if (isThereAlready) {
                  return;
            }
            this.keyCombos.push(keyComboObject);
      };

      removeKeyCombo = (keyComboObject) => {
            this.keyCombos = this.keyCombos.filter(
                  (combo) => !KeyCombo.areKeyCombosEqual(combo, keyComboObject)
            );
      };

      keyDown = (e) => {
            let refinedCode = e.code;

            if (refinedCode == "ShiftLeft" || refinedCode == "ShiftRight") {
                  refinedCode = "Shift";
            }

            if (refinedCode == "ContextMenu") {
                  refinedCode = "Menu";
            }

            if (this.debug) {
                  console.log(
                        `KeyDown: ${refinedCode}; keysPressed: ${
                              this.keysPressed
                        }; keysPressed conditional: ${this.keysPressed.includes(
                              refinedCode
                        )}`
                  );
            }

            if (refinedCode == "Tab" || refinedCode == "Escape") {
                  e.preventDefault();
            }

            if (this.keysPressed.includes(refinedCode)) {
                  return;
            }

            this.keysPressed.push(refinedCode);

            const foundCombo = this.checkForCombo(refinedCode);

            this.onAnyKeyPressedEvents.forEach((callback) => {
                  callback(refinedCode, foundCombo);
            });

            Object.keys(this.onCertainKeyPressedEvents).forEach((key) => {
                  if (key == refinedCode) {
                        this.onCertainKeyPressedEvents[key].forEach((cb) =>
                              cb(refinedCode, foundCombo)
                        );
                  }
            });
      };

      keyUp = (e) => {
            let refinedCode = e.code;

            if (refinedCode == "ShiftLeft" || refinedCode == "ShiftRight") {
                  refinedCode = "Shift";
            }

            if (refinedCode == "ContextMenu") {
                  refinedCode = "Menu";
            }

            if (this.debug) {
                  console.log(
                        `KeyUp: ${refinedCode}; keysPressed: ${
                              this.keysPressed
                        }; keysPressed conditional: ${!this.keysPressed.includes(
                              refinedCode
                        )}`
                  );
            }

            this.keysPressed = this.keysPressed.filter(
                  (keyID) => keyID !== refinedCode
            );

            this.onAnyKeyReleasedEvents.forEach((callback) => {
                  callback(refinedCode);
            });

            Object.keys(this.onCertainKeyReleasedEvents).forEach((key) => {
                  if (key == refinedCode) {
                        this.onCertainKeyReleasedEvents[key].forEach((cb) =>
                              cb(refinedCode)
                        );
                  }
            });
      };

      addOnKeyPressEvent = (key, callback) => {
            if (key == null) {
                  if (!this.onAnyKeyPressedEvents.includes(callback)) {
                        this.onAnyKeyPressedEvents.push(callback);
                  }
            } else {
                  if (!this.onCertainKeyPressedEvents[key]) {
                        this.onCertainKeyPressedEvents[key] = [];
                  }
                  if (this.onCertainKeyPressedEvents[key].includes(callback)) {
                        return;
                  }
                  this.onCertainKeyPressedEvents[key].push(callback);
            }
      };

      addOnKeyReleaseEvent = (key, callback) => {
            if (key == null) {
                  if (!this.onAnyKeyReleasedEvents.includes(callback)) {
                        this.onAnyKeyReleasedEvents.push(callback);
                  }
            } else {
                  if (!this.onCertainKeyReleasedEvents[key]) {
                        this.onCertainKeyReleasedEvents[key] = [];
                  }
                  if (this.onCertainKeyReleasedEvents[key].includes(callback)) {
                        return;
                  }
                  this.onCertainKeyReleasedEvents[key].push(callback);
            }
      };

      removeOnKeyPressEvent = (key, callback) => {
            if (key == null) {
                  this.onAnyKeyPressedEvents =
                        this.onAnyKeyPressedEvents.filter(
                              (cb) => cb !== callback
                        );
            } else {
                  if (!this.onCertainKeyPressedEvents[key]) {
                        return;
                  }
                  this.onCertainKeyPressedEvents[key] =
                        this.onCertainKeyPressedEvents[key].filter(
                              (cb) => cb !== callback
                        );
            }
      };

      removeOnKeyReleaseEvent = (key, callback) => {
            if (key == null) {
                  this.onAnyKeyReleasedEvents =
                        this.onAnyKeyReleasedEvents.filter(
                              (cb) => cb !== callback
                        );
            } else {
                  if (!this.onCertainKeyReleasedEvents[key]) {
                        return;
                  }
                  this.onCertainKeyReleasedEvents[key] =
                        this.onCertainKeyReleasedEvents[key].filter(
                              (cb) => cb !== callback
                        );
            }
      };

      constructor(
            eventSource,
            debug = false,
            preventCtrl = false,
            preventContextMenu = false
      ) {
            this.eventSource = eventSource;
            this.debug = debug;
            this.keysPressed = [];
            this.keyCombos = [];
            this.onAnyKeyPressedEvents = [];
            this.onAnyKeyReleasedEvents = [];
            this.onCertainKeyPressedEvents = {};
            this.onCertainKeyReleasedEvents = {};
            this.eventSource.addEventListener("keydown", this.keyDown);
            this.eventSource.addEventListener("keyup", this.keyUp);
            if (preventContextMenu) {
                  this.eventSource.oncontextmenu = function (e) {
                        e.preventDefault();
                  };
            }

            if (preventCtrl) {
                  this.eventSource.addEventListener("keydown", function (e) {
                        if (e.ctrlKey) {
                              e.preventDefault();
                        }
                  });
            }
      }
};

export { KeyMgr, KeyCombo, KeyHelper };
