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
            KeyA: "A",
            KeyB: "B",
            KeyC: "C",
            KeyD: "D",
            KeyE: "E",
            KeyF: "F",
            KeyG: "G",
            KeyH: "H",
            KeyI: "I",
            KeyJ: "J",
            KeyK: "K",
            KeyL: "L",
            KeyM: "M",
            KeyN: "N",
            KeyO: "O",
            KeyP: "P",
            KeyQ: "Q",
            KeyR: "R",
            KeyS: "S",
            KeyT: "T",
            KeyU: "U",
            KeyV: "V",
            KeyW: "W",
            KeyX: "X",
            KeyY: "Y",
            KeyZ: "Z",
            Tab: "Tab",
            ShiftLeft: "Shift",
            ShiftRight: "Shift",
            ControlLeft: "Ctrl",
            ControlRight: "Ctrl",
            CapsLock: "Caps Lock",
            Escape: "Esc",
            Digit1: "1",
            Digit2: "2",
            Digit3: "3",
            Digit4: "4",
            Digit5: "5",
            Digit6: "6",
            Digit7: "7",
            Digit8: "8",
            Digit9: "9",
            Digit0: "0",
            Quote: `"`,
            Semicolon: `;`,
            Slash: `/`,
            BracketLeft: "[",
            BracketRight: "]",
            Backslash: "\\",
            Comma: ",",
            Period: ".",
            Enter: "Enter",
            rightArrow: "ArrowRight",
            leftArrow: "ArrowLeft",
            upArrow: "ArrowUp",
            downArrow: "ArrowDown",
      };

      static convertKeyCodeToKey(keyCode) {
            return this.keyCodeMap[keyCode] || keyCode;
      }
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
      isKeyPressed(key) {
            return this.keysPressed.includes(key);
      }

      checkForCombo(newKeyPressKeyCode) {
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
      }

      addKeyCombo(keyComboObject) {
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
      }

      removeKeyCombo(keyComboObject) {
            this.keyCombos = this.keyCombos.filter(
                  (combo) => !KeyCombo.areKeyCombosEqual(combo, keyComboObject)
            );
      }

      keyDown(e) {
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
      }

      keyUp(e) {
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
      }

      addOnKeyPressEvent(key, callback) {
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
      }

      addOnKeyReleaseEvent(key, callback) {
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
      }

      removeOnKeyPressEvent(key, callback) {
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
      }

      removeOnKeyReleaseEvent(key, callback) {
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
      }

      constructor(eventSource, debug = false) {
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
            this.eventSource.oncontextmenu = function (e) {
                  e.preventDefault();
            };
            this.eventSource.addEventListener("keydown", function (e) {
                  if (e.ctrlKey) {
                        e.preventDefault();
                  }
            });
      }
};

export { KeyMgr, KeyCombo, KeyHelper };
