/**
 * Handles keyboard navigation for a list of elements.
 * Moves focus to the next or previous element based on the key pressed.
 *
 * @param event - The keyboard event triggering the navigation.
 * @param container - The container element holding the focusable items.
 * @param selector - CSS selector to identify focusable items within the container.
 */
export function handleEmojiNavigation(
  event: KeyboardEvent,
  container: HTMLElement,
  selector: string,
) {
  const { key } = event;

  if (key !== "ArrowUp" && key !== "ArrowDown") return;

  event.preventDefault();

  const elements = Array.from(container.querySelectorAll<HTMLElement>(selector));

  if (elements.length === 0) return;

  const activeElement = document.activeElement as HTMLElement;
  const currentIndex = elements.indexOf(activeElement);

  if (currentIndex === -1) {
    // If focus is not on any element, focus the first one
    elements[0].focus();
    return;
  }

  let nextIndex = currentIndex;

  if (key === "ArrowDown") {
    nextIndex = currentIndex + 1;
    if (nextIndex >= elements.length) {
      nextIndex = 0; // Loop to start
    }
  } else if (key === "ArrowUp") {
    nextIndex = currentIndex - 1;
    if (nextIndex < 0) {
      nextIndex = elements.length - 1; // Loop to end
    }
  }

  const nextElement = elements[nextIndex];
  nextElement?.focus();
  nextElement?.scrollIntoView({ block: "nearest", behavior: "smooth" });
}
