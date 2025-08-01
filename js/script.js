console.log("Lets Write Java Script")
let currentSong = new Audio();
let songs;
let Currfolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    Currfolder = folder
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
    // let a = await fetch("/songs/")
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    // Show all the songs in the Playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
            <img src="icones/MusicIconWhite.svg" alt="MusicIconWhite">
            <div class="info">
                <div>${song.replaceAll("%20", " ")}</div>
                <div>Song Artist</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img src="icones/PlayButtonWhite.svg" alt="">
            </div>
        </li>`;
    }
    // Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })

    return songs

}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${Currfolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "icones/pauseButtonWhite.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0]
            // Get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`)
            let response = await a.json();
            console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML + `
                <div data-folder="${folder}" class="card border">
                    <div class="play">
                        <img src="icones/PlayButtonIcon.svg" alt="PlayButtonIcon">
                    </div>
                    <img src="/songs/${folder}/cover.jpg" alt="cover Image">
                    <h2>${response.title}</h2>
                    <p>${response.description}</p>
                </div>`
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })


}

async function main() {
    // Get the list of all the songs
    await getSongs("songs/trending")
    playMusic(songs[0], true)

    // Display all the albums on the page
    displayAlbums()

    // Attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "icones/pauseButtonWhite.svg"
        }
        else {
            currentSong.pause()
            play.src = "icones/PlayButtonWhite.svg"
        }
    })
    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })

    // add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = '0'
    })

    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = '-110%'
    })

    // add an event listner to previous and next
    previous.addEventListener("click", () => {
        currentSong.pause()
        console.log("previous")

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    next.addEventListener("click", () => {
        currentSong.pause()
        console.log("next")

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
        // if ((index + 1) <= songs.length) {
        //     playMusic(songs[index + 1])
        // }

    })

    // add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting Volume to", e.target.value, "/100")
        document.querySelector(".volumeint").innerHTML = parseInt(e.target.value)
        currentSong.volume = parseInt(e.target.value) / 100
    })

    // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("icones/volumeIconWhite.svg")) {
            e.target.src = e.target.src.replace("icones/volumeIconWhite.svg", "icones/MuteIconWhite.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else {
            e.target.src = e.target.src.replace("icones/MuteIconWhite.svg", "icones/volumeIconWhite.svg")
            currentSong.volume = 0.50;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 50
        }
    })
}

main()

