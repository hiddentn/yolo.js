const STATS_CONTAINER = 'media-container'
const statsContainer = document.getElementById(STATS_CONTAINER);
///////////// STATS.JS /////////////////////
var stats = new Stats();
stats.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
statsContainer.appendChild(stats.dom);
