
export function scrollToElement(selector, config) {
  document.querySelector(selector)?.scrollIntoView({
    behavior: 'smooth',
    block: "start",
    inline: "nearest",
    ...config,
  });
}
