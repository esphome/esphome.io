/** Wires up manual play buttons and (unless reduced motion is requested) autoplay-on-intersection for `.lazy-video` elements, toggling `.lazy-video--playing` on both the video and its `.play-button` sibling. */
export function initLazyVideos(logLabel: string) {
  document.querySelectorAll<HTMLVideoElement>(".lazy-video").forEach((video) => {
    const playButton = document.querySelector<HTMLButtonElement>(`.play-button[data-video-id="${video.id}"]`);

    function setPlaying(playing: boolean) {
      video.classList.toggle("lazy-video--playing", playing);
      playButton?.classList.toggle("lazy-video--playing", playing);
    }

    video.addEventListener("ended", () => setPlaying(false));

    playButton?.addEventListener("click", () => {
      video
        .play()
        .then(() => setPlaying(true))
        .catch((error: unknown) => {
          console.error(`[${logLabel}] Failed to play video:`, error);
        });
    });

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video
            .play()
            .then(() => setPlaying(true))
            .catch(() => {});
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(video);
  });
}
