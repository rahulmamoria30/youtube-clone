// let api_key = "AIzaSyBGEM2JsJFJgFGb02CzSgePb28uh_-KWIo";
const videoCardContainer = document.querySelector(".video-container");
const paginationContainer = document.querySelector(".pagination");
let api_key = "AIzaSyBGEM2JsJFJgFGb02CzSgePb28uh_-KWIo";
let video_http = "https://www.googleapis.com/youtube/v3/videos?";
let channel_http = "https://www.googleapis.com/youtube/v3/channels?";
let videosPerPage = 20;
let currentPage = 1;
let nextPageToken = "";

const fetchData = async (url) => {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
};

const getChannelIcon = async (video_data) => {
  const channelUrl =
    channel_http +
    new URLSearchParams({
      key: api_key,
      part: "snippet",
      id: video_data.snippet.channelId,
    });

  try {
    const data = await fetchData(channelUrl);
    video_data.channelThumbnail = data.items[0].snippet.thumbnails.default.url;
    makeVideoCard(video_data);
  } catch (error) {
    console.error(error);
  }
};

const makeVideoCard = (data) => {
  videoCardContainer.innerHTML += `
        <div class="video" onclick="location.href = 'https://youtube.com/watch?v=${data.id}'">
          <img src="${data.snippet.thumbnails.high.url}" class="thumbnail" alt="">
          <div class="content">
            <img src="${data.channelThumbnail}" class="channel-icon" alt="">
            <div class="info">
              <h4 class="title">${data.snippet.title}</h4>
              <p class="channel-name">${data.snippet.channelTitle}</p>
            </div>
          </div>
        </div>
      `;
  updatePaginationVisibility();
};

const updatePaginationVisibility = () => {
  const totalVideos = videoCardContainer.querySelectorAll(".video").length;
  paginationContainer.style.display = totalVideos >= videosPerPage ? "block" : "none";
};

const changePage = async (nextPage) => {
  currentPage += nextPage;
  document.getElementById("currentPage").innerText = `Page ${currentPage}`;
  videoCardContainer.innerHTML = "";
  await fetchAndDisplayVideos(nextPageToken);
  updatePaginationButtons();
  updatePaginationVisibility();
};

const updatePaginationButtons = () => {
  const prevPageBtn = document.getElementById("prevPageBtn");
  const nextPageBtn = document.getElementById("nextPageBtn");

  nextPageBtn.addEventListener("click", () => {
    paginationContainer.style.display = "none";
    prevPageBtn.disabled = false;
  });

  prevPageBtn.addEventListener("click", () => {
    paginationContainer.style.display = "none";
    if (currentPage === 2) {
      prevPageBtn.disabled = true;
    }
  });
};

const searchBtn = document.querySelector(".search-btn");
const searchInput = document.querySelector(".search-bar");
const searchLink = "https://www.googleapis.com/youtube/v3/search?";

const fetchAndDisplayVideos = async (pageToken = "") => {
  const searchQuery = searchInput.value.trim();

  let videoUrl;
  if (searchQuery) {
    videoUrl =
      searchLink +
      new URLSearchParams({
        key: api_key,
        part: "snippet",
        maxResults: videosPerPage,
        q: searchQuery,
        type: "video",
        pageToken: pageToken,
      });
  } else {
    videoUrl =
      video_http +
      new URLSearchParams({
        key: api_key,
        part: "snippet",
        chart: "mostPopular",
        maxResults: videosPerPage,
        regionCode: "IN",
        pageToken: pageToken,
      });
  }

  try {
    const data = await fetchData(videoUrl);
    nextPageToken = data.nextPageToken;

    let count = 0;

    for (const item of data.items) {
      if (count < videosPerPage) {
        if (searchQuery) {
          item.id = item.id.videoId;
        }
        await getChannelIcon(item);
        count++;
      }
    }

    updatePaginationButtons();
    updatePaginationVisibility();
  } catch (error) {
    console.error(error);
  }
};

fetchAndDisplayVideos();


searchBtn.addEventListener("click", () => {
  redirectToSearchResults();
});

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    redirectToSearchResults();
    paginationContainer.style.display = "none";
  }
});

// Function to handle search and reset current page to 1
const redirectToSearchResults = async () => {
  currentPage = 1;
  const searchUrl =
    searchLink +
    new URLSearchParams({
      key: api_key,
      part: "snippet",
      maxResults: videosPerPage,
      q: `${searchInput.value}`,
      type: "video",
    });

  try {
    const data = await fetchData(searchUrl);
    videoCardContainer.innerHTML = "";
    data.items = data.items.map((current) => ({
      ...current,
      id: current.id.videoId,
    }));
    data.items.forEach((item) => {
      getChannelIcon(item);
    });

    nextPageToken = data.nextPageToken;
    document.getElementById("currentPage").innerText = `Page ${currentPage}`;

    updatePaginationButtons();
    updatePaginationVisibility();
  } catch (err) {
    console.log(err);
  }
};

// Event listener for sidebar toggle
const barsIcon = document.querySelector(".bars");
const sidebar = document.querySelector(".sidebar");

barsIcon.addEventListener("click", () => {
  if (sidebar.style.display === "none") {
    sidebar.style.display = "block";
  } else {
    sidebar.style.display = "none";
  }
});
