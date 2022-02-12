import { KeyMgr, KeyCombo, KeyHelper } from "./KeyMgr/KeyMgr.js";

export default class Scroller {
      keyMgr = null;
      sections = null;
      maxSectionIndex = null;
      navElement = null;
      currentSectionIndex = null;
      throttlingTimeout = null;
      isThrottled = false;

      getCurrentSection() {
            return this.sections[this.currentSectionIndex];
      }

      getClosest(counts, goal) {
            return counts.reduce(function (prev, curr) {
                  return Math.abs(curr - goal) < Math.abs(prev - goal)
                        ? curr
                        : prev;
            });
      }
      getClosestSectionIndex() {
            // get current scroll element index
            const topArray = this.sections.map(
                  (el) =>
                        el.getBoundingClientRect().top +
                        this.scrollSource.pageYOffset
            );
            const closestVal = this.getClosest(
                  topArray,
                  this.scrollSource.pageYOffset
            );
            const index = topArray.indexOf(closestVal);
            return index;
      }

      manageThrottling() {
            if (this.isThrottled) {
                  return false;
            }
            this.isThrottled = true;
            setTimeout(() => {
                  this.isThrottled = false;
            }, this.throttlingTimeout);
            return true;
      }

      initScroll(selectorQueryString) {
            // Init the sections
            this.sections = [...document.querySelectorAll(selectorQueryString)];

            // Add navigation buttons
            this.sections.forEach((el, index) => {
                  const scrollNode = document.createElement("div");
                  scrollNode.classList.add("scroll-node");
                  scrollNode.dataset.index = index;
                  scrollNode.addEventListener("click", (e) =>
                        this.navButtonPressed(e)
                  );
                  this.navElement.appendChild(scrollNode);
            });
            if (this.defaultElementIndex !== null) {
                  this.currentSectionIndex = this.defaultElementIndex;
            } else {
                  this.currentSectionIndex = this.getClosestSectionIndex();
            }
            this.scrollToSection(this.getCurrentSection());
      }
      initKeyManagement() {
            this.keyMgr.addOnKeyPressEvent("ArrowUp", () => {
                  this.scroll("up");
            });
            this.keyMgr.addOnKeyPressEvent("ArrowDown", () => {
                  this.scroll("down");
            });
      }

      scrollToSection(section) {
            this.scrollSource.scrollTo({
                  top:
                        section.getBoundingClientRect().top +
                        this.scrollSource.pageYOffset,
                  behavior: "smooth",
            });
            const scrollNodes = document.querySelectorAll("div.scroll-node");
            scrollNodes.forEach((el, index) => {
                  if (index != this.currentSectionIndex) {
                        el.classList.remove("active");
                  } else {
                        el.classList.add("active");
                  }
            });
      }

      handleScroll(e) {
            const { deltaY } = e;
            const direction = deltaY > 0 ? 1 : -1;

            if (
                  this.currentSectionIndex == this.maxSectionIndex &&
                  direction == 1
            ) {
                  return;
            }
            if (this.currentSectionIndex == 0 && direction == -1) {
                  return;
            }

            if (!this.manageThrottling()) {
                  return;
            }

            this.currentSectionIndex += Number(direction);
            if (this.currentSectionIndex > this.maxSectionIndex - 1) {
                  this.currentSectionIndex = this.maxSectionIndex;
            } else if (this.currentSectionIndex < 0) {
                  this.currentSectionIndex = 0;
            }

            this.scrollToSection(this.getCurrentSection());
      }

      scroll(dir) {
            let deltaY = 0;
            switch (dir) {
                  case "up":
                        deltaY = -1;
                        break;
                  case "down":
                        deltaY = 1;
                        break;
                  default:
                        throw new Error(
                              "Invalid argument 'dir' in function scroll in Scroller.js. Valid values are 'up' or 'down'."
                        );
            }
            this.handleScroll({ deltaY });
      }

      navButtonPressed(e) {
            if (!this.manageThrottling()) {
                  return;
            }
            const { index } = e.target.dataset;
            if (index == this.currentSectionIndex) {
                  return;
            }

            this.currentSectionIndex = Number(index);
            this.scrollToSection(this.getCurrentSection());
      }

      unmount() {
            this.scrollSource.removeEventListener("wheel", (e) =>
                  this.handleScroll(e)
            );
      }

      constructor(
            selectorQueryString,
            navElement,
            throttlingTimeout,
            useKeyMgr,
            defaultElementIndex
      ) {
            if (useKeyMgr == true) {
                  this.keyMgr = new KeyMgr(window, false, false, false);
                  this.initKeyManagement();
            }

            this.scrollSource = window;
            this.navElement = navElement;

            this.isThrottled = false;
            this.throttlingTimeout = throttlingTimeout;
            this.defaultElementIndex = defaultElementIndex;
            this.currentSectionIndex = defaultElementIndex || null;

            this.initScroll(selectorQueryString);

            this.maxSectionIndex = this.sections.length - 1;

            this.scrollSource.addEventListener("wheel", (e) =>
                  this.handleScroll(e)
            );
      }
}
