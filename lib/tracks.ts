export type Track = {
  id: string;
  title: string;
  artist: string;
  film: string;
  year: number;
  duration: string;
  videoId: string;
};

export type Playlist = {
  name: string;
  tracks: Track[];
};

function track(
  title: string,
  videoId: string,
  artist: string,
  index: number
): Track {
  return {
    id: `${artist.toLowerCase().replace(/\s+/g, "-")}-${index}`,
    title,
    artist,
    film: "",
    year: 0,
    duration: "0:00",
    videoId,
  };
}

const dhandaNyoliwalaTitles: [string, string][] = [
  ["Afghan", "HIP5uQ622HA"],
  ["No Mercy", "pb-NGCQS_CU"],
  ["Ishq", "s0bJkT5EyTc"],
  ["Vomit on Paper", "wzN4pApVUoo"],
  ["Up To U", "T0H_LWLiOGk"],
  ["Russian Bandana", "1OAjeECW90E"]
];

const vikramSarkarTitles: [string, string][] = [
  ["Nazra Ke Teer", "cehyr946p64"],
  ["Green Flag", "j3ve-olNH6s"],
  ["Fortuner", "NCVis44G6fY"],
  ["Gaadi 150", "YSb0Ho5RCQ0"]
];


function createTracks(
  songs: [string, string][],
  artist: string
): Track[] {
  return songs
    .filter(([title, videoId]) => videoId.length > 0)
    .map(([title, videoId], index) =>
      track(title, videoId, artist, index)
    );
}

export const playlists: Playlist[] = [
  {
    name: "Dhanda Nyoliwala",
    tracks: createTracks(
      dhandaNyoliwalaTitles,
      "Dhanda Nyoliwala"
    ),
  },
  {
    name: "Vikram Sarkar",
    tracks: createTracks(
      vikramSarkarTitles,
      "Vikram Sarkar"
    ),
  },
];