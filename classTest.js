import Scroller from "./js/Scroller.js";

window.onload = () => {
      const nav = document.querySelector(".flex-cont");
      console.log(nav);
      const scroller = new Scroller("section", nav, 500, true, 0);
};
