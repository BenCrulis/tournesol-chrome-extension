// Youtube doesnt completely load a video page, so content script doesn't lauch correctly without these events

// This part is called on connection for the first time on youtube.com/*
/* ********************************************************************* */

var browser = browser || chrome;

document.addEventListener('yt-navigate-finish', process);

if (document.body) process();
else document.addEventListener('DOMContentLoaded', process);

/* ********************************************************************* */

function process() {
  // Get video id via URL
  var videoId = new URL(location.href).searchParams.get('v');

  // Only enable on youtube.com/watch?v=* pages
  if (!location.pathname.startsWith('/watch') || !videoId) return;

  // Timer will run until needed elements are generated
  var timer = window.setInterval(createButtonIsReady, 300);

  function createButtonIsReady() {
    /*
     ** Wait for needed elements to be generated
     ** It seems those elements are generated via javascript, so run-at document_idle in manifest is not enough to prevent errors
     **
     ** Some ids on video pages are duplicated, so I take the first non-duplicated id and search in its childs the correct div to add the button
     ** Note: using .children[index] when child has no id
     */
    if (
      !document.getElementById('menu-container') ||
      !document.getElementById('menu-container').children.item('menu') ||
      !document.getElementById('menu-container').children.item('menu').children[0] ||
      !document.getElementById('menu-container').children['menu'].children[0].children['top-level-buttons-computed']
    ) return;

    // If the button already exists, don't create a new one
    if (document.getElementById('tournesol-statistics')) {
      window.clearInterval(timer);
      return;
    }

    window.clearInterval(timer);

    browser.runtime.sendMessage({
      message: 'getVideoStatistics',
      video_id: videoId
    }, function(resp_and_constants) {
			let resp = resp_and_constants[0];
			const CONSTANTS = resp_and_constants[1];
			const CRITERIAS = CONSTANTS["features"];
			console.log(CONSTANTS);
      if (document.getElementById('tournesol-details-button')) {
        console.log("not rendering")
        return;
      }

      if (resp && resp.results && resp.results.length == 1) {
        details = resp.results[0];
        if (details.tournesol_score == 0) return;
        if (details.tournesol_score > 0 && details.tournesol_score < 400) alert("This video was rated below average by Tournesol's contributors", "Ok")
        if (details.tournesol_score < 0) alert("Be careful! This video was rated very negatively by Tournesol's contributors", "Ok")

        // Create Button
        var statisticsButton = document.createElement('button');
        statisticsButton.setAttribute('id', 'tournesol-details-button');

        // Text td for better vertical alignment
        var statisticsTextTd = document.createElement('td');
        statisticsTextTd.setAttribute('valign', 'middle');
        statisticsTextTdText = document.createTextNode(`Score: ${details.tournesol_score.toFixed(0)}`)
        statisticsTextTd.append(statisticsTextTdText);
        statisticsButton.append(statisticsTextTd);

				// statistics panel
				statsPanel = document.createElement("div");
				statsPanel.setAttribute('id', "tournesol-stats-panel");
				statsPanel.style.display = 'none';

				const PANEL_DISPLAY = 'block';

				function toggle_panel() {
					if (statsPanel.style.display === "none") {
						statsPanel.style.display = PANEL_DISPLAY;
					}
					else {
						statsPanel.style.display = 'none';
					}
				}

				plotlyBarChart = document.createElement("div");

				console.log(details);

				criteria_values = CRITERIAS.map((c) => details[c["feature"]]).reverse();
				criteria_names = CRITERIAS.map((c) => c["description"]).reverse();

				console.log(criteria_values);

				var data = [{
					type: 'bar',
					x: criteria_values,
					y: criteria_names,
					marker: {
						color: CRITERIAS.map((c) => c["color"]).reverse(),
					},
					orientation: 'h',
					width: 0.5
				}];

				const layout = {
					width: 720,
					height: 250,
					title: "criteria scores",
					//font: {size: 18},
					dragmode: false, // prevent resizing by clic and drag

					margin: {
					    l: 230,
					    r: 20,
					    t: 30,
					    b: 20
				    },

				};

				const config = {
					displayModeBar: false,
				};

		        Plotly.newPlot(plotlyBarChart, data, layout, config);

				statsPanel.append(plotlyBarChart);

				detailsLink = document.createElement("a")
				detailsLink.setAttribute('href', `https://tournesol.app/details/${videoId}`)
				detailsLink.innerText = "see more details on tournesol.app"
				statsPanel.append(detailsLink);

				statisticsButton.append(statsPanel);

        // On click

        statisticsButton.onclick = toggle_panel;

				var div = document.getElementById('menu-container')
					.children['menu']
					.children[0]
					.children['top-level-buttons-computed'];

        div.insertBefore(statisticsButton, div.children[2]);
      }
    });
  }
}
