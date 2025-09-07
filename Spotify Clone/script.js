
let currentSong = new Audio();
let songs;
let currFolder;

// Select DOM elements
let play = document.getElementById("play");
let previous = document.getElementById("previous");
let next = document.getElementById("next");


function formatTime(seconds) {
  const totalSeconds = Math.floor(seconds); // remove decimals
  const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const secs = (totalSeconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

async function getSongs (folder) {
    currFolder = folder;
    let a = await fetch(`./${folder}/`)
    let response = await a.text();
    console.log(response);
    let div = document.createElement('div');
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }

    }

}

const playMusic = (track) => {
    currentSong.src = `./${currFolder}/` + track
    //let audio = new Audio(`./${currFolder}/` + track)
    currentSong.play()
    play.src = "pause.svg"
    document.querySelector(".songinfo").innerHTML = track.replaceAll("%20", " ")

    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"


     // show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" src="svgs/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Lion King</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="svgs/play.svg" alt="">
                            </div></li>`;

    }

    //play the first song
    //var audio = new Audio(songs[0]);
    //audio.play();

    /*audio.addEventListener("ontimeupdate", () => {
        let duration = audio.duration;
        console.log(audio.duration, audio.currentSrc, audio.currentTime);
    });*/


    //Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })

    })
}



async function displayAlbums(){
     let a = await fetch(`./songs/`)
    let response = await a.text();
    console.log(response);
    let div = document.createElement('div');
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")

    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
        for (let index = 0; index < array.length; index++) {
            const e = array[index];


        if(e.href.includes("/songs")){
            let folder = e.href.split("/").slice(-2)[0]
            //get the metadata of the folder
            let a = await fetch(`./songs/${folder}/info.json`)
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
                        <div class="play">
                            <img src="svgs/play.svg" alt="">
                        </div>
                        <img src="./songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>

                    </div>`
        }
        }
         // load the playlist whenever a card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click", async item =>{
            await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            if (songs && songs.length > 0) {
                playMusic(songs[0]);
            }
        })
    })



    }

   

async function main() {

    //get the list  of all songs
    await getSongs("songs/ncs");
    if (songs && songs.length > 0) {
        currentSong.src = "./songs/ncs/" + songs[0];
        document.querySelector(".songinfo").innerHTML = songs[0].replaceAll("%20", " ");
    } else {
        console.error("No songs found in the folder.");
    }


    //display all the albums on the page
    displayAlbums()

   

    //attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "svgs/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "svgs/play.svg"
        }
    })


    //listen for the timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
        })

    //add and event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e=> {
        let percent = (e.offsetX/e.target.getBoundingClientRect().width) * 100;
       document.querySelector(".circle").style.left = percent + "%";
       currentSong.currentTime = (percent/100) * currentSong.duration;
    })
    

    //add an event listener to hamburger
    document.querySelector(".hamburger").addEventListener("click", ()=> {
    document.querySelector(".left").style.left = "0";
    })


      //add an event listener for close button
      document.querySelector(".close").addEventListener("click", ()=> {
    document.querySelector(".left").style.left = "-120%";
    })


    //add an event listener for previous
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index-1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    //add an event listener for next
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })
    

    // add event to volume slider
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value)/100;
})
    


    // add event listeneer to mute the track
    document.querySelector(".volume>img").addEventListener("click", e=>{
        console.log(e.target)
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
             document.querySelector(".range").getElementsByTagName("input")[0].value = 0;

        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = 0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 33;
        }
    })

    



}

main();
