"use strict";
//My tvMAze api key:  uB-opaTjB_hyq4NN8igG1ImPjwEErOYD
//Root URL: https://api.tvmaze.com
const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");
const $episodesList = $("#episodes-list");

document.body.style.backgroundColor = "rgb(255,222,173)";

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(userSearch) {
  let response = await axios.get(
    `http://api.tvmaze.com/search/shows?q=${userSearch}`
  );

  return response.data;
}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    if (show.show.image.medium === undefined) {
      show.show.image.medium = "https://tinyurl.com/tv-missing";
    }
    const $show = $(
      `<div data-show-id="${show.show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src="${show.show.image.medium}"
              alt="Bletchly Circle San Francisco" 
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.show.name}</h5>
             <div><small>${show.show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `
    );

    $showsList.append($show);
  }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#search-query").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  $episodesList;
  evt.preventDefault();
  await searchForShowAndDisplay();
});

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const response = await axios.get(
    `http://api.tvmaze.com/shows/${id}/episodes`
  );

  return response.data;
}

/** Write a clear docstring for this function... */
/* Accepts an array of episodes (to be given via getEpisodesOfShow()) iterates through, 
creates a DOM element for each and adds to #episodesArea. Gives user name/season/ep number
/summary of episode Then shows the episodesArea
*/

function populateEpisodes(episodes) {
  $episodesList.empty();

  for (let episode in episodes) {
    if (!episodes[episode].summary) {
      episodes[episode].summary = "No description available";
    }
    const $episode = $(
      `<li><b>
    ${episodes[episode].name} S${episodes[episode].season}:E${episodes[episode].number}
    <br> ${episodes[episode].summary}</b></br>
    </li>`
    );
    $episodesList.append($episode);
  }
  $episodesArea.show();
}

/* Delgates the episodes button as the event handler and attaches a function that will
get the ShowID based off the parent episode DIV, use that ID in the showInfo function
to obtain an obj of that show's info. And then use that info to display to user episode summary,
season and episode number. If episodes button is clicked again, removes episodes li and hides 
episodesArea
*/
$showsList.on("click", ".Show-getEpisodes", async function (e) {
  if (!document.querySelector("#episodes-list li")) {
    const $showID = $(e.target).closest(".Show").data("show-id");
    const showInfo = await getEpisodesOfShow($showID);
    populateEpisodes(showInfo);
  } else {
    document.querySelector("#episodes-list").innerHTML = "";
    $episodesArea.hide();
  }
});
