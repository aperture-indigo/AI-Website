(function () {
  const iframe = document.getElementById("hero-video");

  if (!iframe || !window.Vimeo || !window.Vimeo.Player) {
    return;
  }

  const trimEnd = Number.parseFloat(iframe.dataset.trimEnd || "0");
  const player = new window.Vimeo.Player(iframe);
  let loopAt = null;
  let seeking = false;

  player.getDuration().then((duration) => {
    loopAt = Math.max(0, duration - trimEnd);
  }).catch(() => {
    loopAt = null;
  });

  player.on("timeupdate", (event) => {
    if (!loopAt || seeking || event.seconds < loopAt) {
      return;
    }

    seeking = true;
    player.setCurrentTime(0).then(() => {
      seeking = false;
      return player.play();
    }).catch(() => {
      seeking = false;
    });
  });
})();
