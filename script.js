"use strict";
// ******************* Clases ****************
class Melody {
  constructor(file, nodo) {
    this.name = file.name;
    this.file = file;
    this.size = `${(file.size / 1024 ** 2).toFixed(2)}Mb`;
    this.nodo = nodo;
    this.key = this.file.name;
  }
  get getLocalUrl() {
    let url = URL.createObjectURL(this.file);
    return url;
  }
  get getNodo() {
    this.nodo.classList.add("list-song");
    this.nodo.dataset.key = this.key;
    this.nodo.children[0].classList.add("list-song-name");
    this.nodo.children[0].textContent = this.name;
    this.nodo.children[0].title = this.name;
    this.nodo.children[1].classList.add("list-song-size");
    this.nodo.children[1].textContent = this.size;
    return this.nodo;
  }
}

// ********************* variables ************************
const reproductor = document.querySelector(".player"),
  audioBar = document.querySelector(".controls-duration"),
  play = document.getElementById("play"),
  back = document.getElementById("previous"),
  next = document.getElementById("next"),
  skipBack = document.getElementById("skip_back"),
  skipNext = document.getElementById("skip_forward"),
  loadMusic = document.getElementById("add"),
  listBtn = document.getElementById("list"),
  list = document.querySelector(".list"),
  timersContainer = document.querySelector(".controls-time-container"),
  playIcon = document.getElementById("icon-play"),
  pauseIcon = document.getElementById("icon-pause"),
  songName = reproductor.querySelector(".song-name"),
  volume = reproductor.querySelector(".volume-input");

let listaAudios = [];
let audio = new Audio();
let intervalo = null;

// **************** Funciones ****************************

//para y pausa la cancion y icono de cambia el boton play
function playPause() {
  if (audio.src === "") return false;
  if (audio.paused || audio.ended) {
    audio.play();
    if (!playIcon.classList.contains("hide")) playIcon.classList.add("hide");
    if (pauseIcon.classList.contains("hide"))
      pauseIcon.classList.remove("hide");
  } else {
    audio.pause();
    playIcon.classList.toggle("hide");
    pauseIcon.classList.toggle("hide");
  }
}

function createModal() {
  let modal = document.createElement("div");
  modal.classList.add("modal");
  let close = document.createElement("span");
  close.classList.add("material-icons", "modal-close");
  close.textContent = "close";
  modal.appendChild(close);
  return modal;
}

//añade canciones a la lista
function addSongs(listSongs) {
  let fragment = document.createDocumentFragment();
  general: for (let el of listSongs) {
    if (!el.type.includes("audio")) continue;

    let article = document.createElement("article");
    let songName = document.createElement("p");
    let size = document.createElement("size");

    article.appendChild(songName);
    article.appendChild(size);

    let melodyObject = new Melody(el, article);

    // valida que no se repitan
    for (let elListaAudios of listaAudios) {
      if (elListaAudios.key === melodyObject.key) continue general;
    }

    fragment.appendChild(melodyObject.getNodo);
    listaAudios.push(melodyObject);
  }
  list.lastElementChild.appendChild(fragment);
  settingAudio(listaAudios[0].nodo);
}

// configura la cancion seleccionada para reproducirla
function settingAudio(nodo) {
  // configurar icono play
  if (playIcon.classList.contains("hide")) playIcon.classList.remove("hide");
  if (!pauseIcon.classList.contains("hide")) pauseIcon.classList.add("hide");

  if (audio.src !== "") {
    audio.pause();
    audio.src = "";
  }
  let key = null;
  if (nodo.matches(".list-song")) key = nodo.dataset.key;
  else key = nodo.parentElement.dataset.key;

  let objectSong = listaAudios.filter(
    (audioInLista) => audioInLista.key === key
  )[0];

  //definiendo audio actual
  audio.src = objectSong.getLocalUrl;

  //añadiendo eventos
  audio.addEventListener("play", playAudio);
  audio.addEventListener("pause", pauseAudio);
  audio.addEventListener("ended", endAudio);

  songName.textContent = objectSong.name;
  songName.title = objectSong.name;

  list.classList.remove("list-active");

  return playPause();
}

function playAudio(e) {
  // para cambiar el progress de la cancion
  intervalo = setInterval(() => {
    audioBar.value = audio.currentTime;
    //tiempo transcurrido
    let miliseconds = new Date(audio.currentTime * 1000)
      .toLocaleTimeString()
      .split(":");
    timersContainer.children[0].textContent = `${miliseconds[1]}:${miliseconds[2]}`;

    //tiempo total
    audioBar.max = Math.floor(audio.duration);
    let totalMiliseconds = new Date(audio.duration * 1000)
      .toLocaleTimeString()
      .split(":");
    timersContainer.children[1].textContent = `${totalMiliseconds[1]}:${totalMiliseconds[2]}`;
  }, 500);
}

function pauseAudio(e) {
  clearInterval(intervalo);
}

function endAudio() {
  clearInterval(intervalo);
  timersContainer.children[0].textContent = "--:--";
  timersContainer.children[1].textContent = "--:--";

  if (playIcon.classList.contains("hide")) playIcon.classList.toggle("hide");
  if (!pauseIcon.classList.contains("hide")) pauseIcon.classList.toggle("hide");
  audioBar.value = parseInt(audio.duration);
  changeAudio();
}

// cambia de cancion adelante o atras
function changeAudio(next = true) {
  if (list.lastElementChild.children.length <= 1 || audio.src === "")
    return false;
  let factor = 1;
  if (!next) factor = -1;
  let objetoActual = listaAudios.filter((el) => el.key === songName.title)[0];

  let objetoSolicitado =
    listaAudios[listaAudios.indexOf(objetoActual) + factor] || objetoActual;

  return settingAudio(objetoSolicitado.nodo);
}

//crea form para cargar musica
function createFormSong() {
  let modal = createModal();
  let input = document.createElement("input");
  let contenedor = document.createElement("article");
  let label = document.createElement("label");

  label.classList.add("ventana-form-label");
  input.classList.add("ventana-form-input");
  input.type = "file";
  input.id = "file-audio";
  input.accept = "audio/*";
  input.multiple = true;
  label.for = input.id;
  label.textContent = "Selecciona tus canciones";
  contenedor.classList.add("ventana-form");

  contenedor.appendChild(label);
  contenedor.appendChild(input);
  modal.appendChild(contenedor);
  return document.body.appendChild(modal);
}
// ********************* Eventos *************************************

audioBar.addEventListener("change", (e) => {
  if (audio.src !== "") audio.currentTime = e.target.value;
});

// **************************** Eventos DOM ******************************

document.addEventListener("click", (e) => {
  //cierra modal
  if (e.target.matches(".modal-close")) {
    return e.target.parentElement.remove();
  }

  if (e.target === loadMusic || e.target.parentElement === loadMusic)
    return createFormSong();

  //cierra lista
  if (
    e.target === listBtn ||
    e.target.parentElement == listBtn ||
    e.target.matches(".list-close")
  ) {
    return list.classList.toggle("list-active");
  }

  //pausa despausa
  if ((e.target === play || e.target.parentElement == play) && audio)
    return playPause();

  if (
    e.target.matches(".list-song") ||
    e.target.parentElement.matches(".list-song")
  )
    return settingAudio(e.target);

  if (e.target === skipBack || e.target.parentElement === skipBack) {
    if (audio.src === "") return false;
    if (audio.currentTime + 10 >= audio.duration)
      return (audio.currentTime = audio.duration);
    return (audio.currentTime = audio.currentTime - 10);
  }

  if (e.target === skipNext || e.target.parentElement === skipNext) {
    if (audio.src === "") return false;
    audio.currentTime = audio.currentTime + 10;
  }

  if (e.target === next || e.target.parentElement === next)
    return changeAudio();

  if (e.target === back || e.target.parentElement === back)
    return changeAudio(false);
});

document.addEventListener("change", (e) => {
  if (e.target.matches(".ventana-form-input")) {
    addSongs(e.target.files);
    document.querySelector(".modal").remove();
  }

  if (e.target === volume || audio.src !== "") {
    audio.volume = parseInt(volume.value) / 20;
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key == "ArrowUp" && audio.src !== "") {
    if (audio.volume + 0.05 > 1) audio.volume = 1;
    else audio.volume = audio.volume + 0.05;
    volume.value = audio.volume * 20;
  }

  if (e.key == "ArrowDown" && audio.src !== "") {
    if (audio.volume - 0.05 < 0) audio.volume = 0;
    else audio.volume = audio.volume - 0.05;
    volume.value = audio.volume * 20;
  }

  if (e.key == "ArrowLeft" && audio.src !== "") {
    if (!audio.currentTime - 5 < 0) audio.currentTime = audio.currentTime - 5;
  }

  if (e.key == "ArrowRight" && audio.src !== "") {
    if (!(audio.currentTime + 5 > audio.duration))
      audio.currentTime = audio.currentTime + 5;
  }

  if (e.key == "N" && audio.src !== "") return changeAudio();

  if (e.key == "P" && audio.src !== "") return changeAudio(false);

  if (e.key == " " && audio.src !== "") return playPause();
  if (e.key == "m" && audio.src !== "") {
    if(audio.muted) audio.muted = false;
    else audio.muted = true;
  }
});
