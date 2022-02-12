const sections = [...document.querySelectorAll("section")];
const amountOfSections = sections.length;
const maxSectionIndex = sections.length - 1;
const navElement = document.querySelector("nav");
let currentSectionIndex = 0;

let isThrottled = false;
const throttlingTimeout = 500;

const getClosest = (counts, goal) => {
      return counts.reduce(function (prev, curr) {
            return Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev;
      });
};

const manageThrottling = () => {
      if (isThrottled) {
            return false;
      }
      isThrottled = true;
      setTimeout(() => {
            isThrottled = false;
      }, throttlingTimeout);
      return true;
};

const getClosestSectionIndex = () => {
      // get current scroll element index
      const topArray = sections.map(
            (el) => el.getBoundingClientRect().top + window.pageYOffset
      );

      const closestVal = getClosest(topArray, window.pageYOffset);
      const index = topArray.indexOf(closestVal);
      return index;
};

const scrollToSection = (section) => {
      window.scrollTo({
            top: section.getBoundingClientRect().top + window.pageYOffset,
            behavior: "smooth",
      });
      const scrollNodes = document.querySelectorAll("div.scroll-node");
      scrollNodes.forEach((el, index) => {
            if (index != currentSectionIndex) {
                  el.classList.remove("active");
            } else {
                  el.classList.add("active");
            }
      });
};

const navButtonPressed = (e) => {
      if (!manageThrottling()) {
            return;
      }
      const { index } = e.target.dataset;
      if (index == currentSectionIndex) {
            return;
      }

      currentSectionIndex = Number(index);
      scrollToSection(getCurrentSection());
};

const initScroll = () => {
      sections.forEach((el, index) => {
            const scrollNode = document.createElement("div");
            scrollNode.classList.add("scroll-node");
            scrollNode.dataset.index = index;
            scrollNode.addEventListener("click", (e) => navButtonPressed(e));
            navElement.appendChild(scrollNode);
      });
      currentSectionIndex = getClosestSectionIndex();
      scrollToSection(getCurrentSection());
};
const getCurrentSection = () => {
      return sections[currentSectionIndex];
};

const handleScroll = (e) => {
      if (!manageThrottling()) {
            return;
      }
      const { deltaY } = e;
      const direction = deltaY > 0 ? 1 : -1;

      if (currentSectionIndex == maxSectionIndex && direction == 1) {
            return;
      }
      if (currentSectionIndex == 0 && direction == -1) {
            return;
      }

      currentSectionIndex += Number(direction);
      if (currentSectionIndex > maxSectionIndex - 1) {
            currentSectionIndex = maxSectionIndex;
      } else if (currentSectionIndex < 0) {
            currentSectionIndex = 0;
      }

      scrollToSection(getCurrentSection());
};
initScroll();
document.body.addEventListener("wheel", (e) => handleScroll(e));
