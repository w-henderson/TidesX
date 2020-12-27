const taglines = [
  "When's high tide?",
  "What about tomorrow?",
  "What's the tide doing?",
  "Is the tide coming in?"
];

const charDelay = 0.03;
const directionDelay = 2.5;

var currentTagline = 0;
var direction = 0;
var element;

window.addEventListener("load", () => {
  element = document.querySelector("#changingText");
  updateTaglines();
});

function wait(sec) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, sec * 1000);
  });
}

async function updateTaglines() {
  for (let taglineIndex = 0; taglineIndex < taglines.length; taglineIndex++) {
    element.innerHTML = "<span style='opacity:0'>" + taglines[taglineIndex] + "</span>";
    for (let charIndex = 0; charIndex <= taglines[taglineIndex].length; charIndex++) {
      element.innerHTML = taglines[taglineIndex].substr(0, charIndex) + "<span style='opacity:0'>" + taglines[taglineIndex].substr(charIndex, taglines[taglineIndex].length - charIndex) + "</span>";
      await wait(charDelay);
    }
    await wait(directionDelay);
    for (let charIndex = taglines[taglineIndex].length; charIndex >= 0; charIndex--) {
      element.innerHTML = taglines[taglineIndex].substr(0, charIndex) + "<span style='opacity:0'>" + taglines[taglineIndex].substr(charIndex, taglines[taglineIndex].length - charIndex) + "</span>";
      await wait(charDelay);
    }
  }
  await updateTaglines();
}