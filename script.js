import { createModelScene } from "./scene3d.js";

const worldScenes = new Map();


async function renderWorldModels() {
  const containers = document.querySelectorAll(".planet-model");

  for (const container of containers) {
    // Не завантажуємо модель повторно
    if (worldScenes.has(container)) continue;

    const modelPath = container.dataset.modelPath;

    try {
      const scene = await createModelScene({
        container,

        autoRotateSpeed: 0.001,

        models: [
          {
            id: modelPath,
            title: "Planet",
            path: modelPath,
            rotation: Math.PI,

            position: {
              x: 0,
              y: 0,
              z: 0
            },

            // Масштаб автоматично підлаштовується
            // у createModelScene()
          }
        ],

        background: 0x000000
      });

      worldScenes.set(container, scene);

    } catch (error) {
      console.error(
        `Не вдалося завантажити планету ${modelPath}:`,
        error
      );
    }
  }
}

let characterPlanetScene = null;
let storyPlanetScene = null;

async function renderHorizonPlanet(containerId, worldKey, existingScene) {
  if (existingScene) {
    existingScene.dispose();
  }

  const container = document.getElementById(containerId);
  if (!container) return null;

  container.innerHTML = "";

  const modelPath =
    worldKey === "mars"
      ? "/assets/models/planets/mars.glb"
      : "/assets/models/planets/moon.glb";

  try {
    return await createModelScene({
      container,
      autoRotateSpeed: 0,
      staticRender: true,
      models: [
        {
          id: `${containerId}-${worldKey}`,
          title: worldKey,
          path: modelPath,
          rotation: 0,
          cameraFill: 0.65,
          position: { x: 0, y: 0, z: 0 }
        }
      ],
      background: 0x000000
    });
  } catch (error) {
    console.error(`Не вдалося завантажити 3D-фон планети ${modelPath}:`, error);
    return null;
  }
}


const worlds = {
  moon: {
    title: "Moon",
    background: "assets/moon.svg",
    characters: [
      {
        id: "apollo11",
        name: "Apollo 11",
        mission: "Apollo 11",
        year: "1970",
        image: "assets/rover-moon.svg",
        model: "/assets/models/rovers/apollo11.glb"
      },
      {
        id: "apollo15",
        name: "Apollo 15",
        mission: "Apollo 15",
        year: "1971",
        image: "assets/rover-moon-2.svg",
        model: "/assets/models/rovers/apollo15.glb"
      }
    ]
  },

  mars: {
    title: "Mars",

    background: "assets/mars.svg",
    characters: [
      {
        id: "spirit",
        name: "Opportunity",
        mission: "Mars Science Laboratory",
        year: "2011",
        description: "",
        image: "assets/rover-mars.svg",
        model: "/assets/models/rovers/spirit.glb"
      },
      {
        id: "insight",
        name: "InSight",
        mission: "Mars 2020",
        year: "2020",
        description: "",
        image: "assets/rover-mars-2.svg",
        model: "/assets/models/rovers/insight.glb"
      },
      {
        id: "ingenuity",
        name: "Ingenuity",
        mission: "Mars 2020",
        year: "2020",
        description: "",
        image: "assets/rover-mars-2.svg",
        model: "/assets/models/rovers/ingenuity.glb"
      }
    ]
  }
};

// Персонажі, які знаходяться у відкритому космосі
const wanderers = [
  {
    id: "voyager",
    name: "Voyager1",
    role: "",
    description: "",
    image: "assets/rover-mars.svg",
    model: "/assets/models/rovers/voyager.glb",
    world: "mars",
    location: ""
  },
  {
    id: "pioneer",
    name: "Pioneer10",
    role: "",
    position: {
      x: 0,
      y: 1.5,
      z: 0
    },
    description: "",
    image: "assets/rover-moon-2.svg",
    world: "moon",
    location: "Deep space",
    model: "/assets/models/rovers/pioneer.glb"
  }
];

/* =========================
   3D-МОДЕЛЬ APOLLO 11
========================= */

const characterScenes = new Map();
let storyCharacterScene = null;
const wandererScenes = new Map();

function disposeCharacterScenes() {
  characterScenes.forEach(scene => scene.dispose());
  characterScenes.clear();
}

function disposeWandererScenes() {
  wandererScenes.forEach(scene => scene.dispose());
  wandererScenes.clear();
}

async function renderCharacterModels() {
  characterScenes.forEach(scene => scene.dispose());
  characterScenes.clear();

  const containers = document.querySelectorAll(
    ".character-card .character-model[data-model-path]"
  );

  for (const container of containers) {
    const modelPath = container.dataset.modelPath;
    if (!modelPath) continue;

    try {
      const scene = await createModelScene({
        container,
        models: [{
          id: modelPath,
          title: "Rover",
          path: modelPath,
          cameraFill: 0.92,
          position: { x: 0, y: 0, z: 0 }
        }],
        background: 0x17191d
      });

      characterScenes.set(container, scene);

    } catch (error) {
      console.error(`Помилка завантаження моделі ${modelPath}:`, error);
    }
  }
}

/* =========================
   МАНДРІВНИКИ
========================= */


function renderWanderers() {
  const container = document.getElementById("wanderers");

  if (!container) return;

  container.innerHTML = "";

  // Фіксовані безпечні позиції
  const positions = {
    voyager: {
      left: "7%",
      top: "60%"
    },
    pioneer: {
      left: "86%",
      top: "60%"
    }
  };

  wanderers.forEach((character, index) => {
    const position = positions[character.id];

    if (!position) return;

    const button = document.createElement("button");

    button.className = "wanderer";

    if (character.model) {
      button.classList.add("wanderer--3d");
    }

    button.style.left = position.left;
    button.style.top = position.top;

    button.style.animationDelay = `${index * 0.7}s`;

    button.innerHTML = `
      ${
        character.model
          ? `<div
              class="wanderer-model"
              data-model-path="${character.model}"
            ></div>`
          : `<img src="${character.image}" alt="${character.name}">`
      }

      <span class="wanderer-name">${character.name}</span>
    `;

    button.addEventListener("click", () => {
      startWandererStory(character);
    });

    container.appendChild(button);
  });

  renderWandererModels();
}


async function renderWandererModels() {
  const containers = document.querySelectorAll(".wanderer-model");

  for (const container of containers) {
    const modelPath = container.dataset.modelPath;

    // Знаходимо відповідного персонажа
    const character = wanderers.find(
      item => item.model === modelPath
    );

    if (!character) continue;

    try {
      const scene = await createModelScene({
        container,

        models: [
          {
            id: character.id,
            title: character.name,
            path: modelPath,

            // Індивідуальний розмір
            scaleMultiplier: 16,
            cameraFill: 1.5,

            // Індивідуальна висота
            position: character.position ?? {
              x: 0,
              y: 0,
              z: 0
            }
          }
        ],

        background: 0x000000
      });

      wandererScenes.set(container, scene);

    } catch (error) {
      console.error(
        `Не вдалося завантажити ${modelPath}:`,
        error
      );
    }
  }
}


/* =========================
   ІСТОРІЯ МАНДРІВНИКІВ
========================= */


async function startWandererStory(character) {
  storyEntryPoint = "wanderer";
  selectedWorld = character.world;
  selectedCharacter = character;
  currentSlide = 0;

  // Очищаємо попередню модель історії
  if (storyCharacterScene) {
    storyCharacterScene.dispose();
    storyCharacterScene = null;
  }

  document.getElementById("story-screen")
    .classList.add("story-screen--space");

  const sprite = document.getElementById("character-sprite");
  const modelContainer = document.getElementById("character-model");

  sprite.style.display = "none";
  modelContainer.style.display = "none";
  modelContainer.innerHTML = "";
  modelContainer.classList.remove("character-model--animate");

  if (character.model) {
    modelContainer.style.display = "block";

    void modelContainer.offsetWidth;
    modelContainer.classList.add("character-model--animate");

    try {
      const scene = await createModelScene({
        container: modelContainer,
        models: [{
          id: character.id,
          title: character.name,
          path: character.model,
          scaleMultiplier: 2.5,
          position: { x: 0, y: 0, z: 0 }
        }],
        background: 0x000000
      });

      storyCharacterScene = scene;

    } catch (error) {
      console.error("Error", error);

      modelContainer.style.display = "none";
      sprite.src = character.image;
      sprite.alt = character.name;
      sprite.style.display = "block";
    }
  } else {
    sprite.src = character.image;
    sprite.alt = character.name;
    sprite.style.display = "block";
  }

  document.getElementById("speaker-name").textContent =
    character.name;

  document.getElementById("scene-location").textContent =
    character.location;

  showScreen(storyScreen);
  renderSlide();
}


/* =========================
   ІСТОРІЇ
========================= */

const stories = {
  voyager: [
    "I was engineered at NASA's Jet Propulsion Laboratory in the mid-1970s under chief scientist Edward Stone to ride a once-in-175-years alignment of the outer planets.",
    "Because sunlight at Jupiter and Saturn is too weak for solar panels, General Electric built me three Radioisotope Thermoelectric Generators that convert heat from decaying plutonium-238 oxide into electricity.",
    "My brain runs on three specific computer subsystems with just 69 kilobytes of total memory—less than a modern car key fob.",
    "A fiberglass magnetometer rod keeps sensitive sensors away from my own electronics.",
    "Bolted to my side is the Golden Record, curated by Carl Sagan’s team at Cornell University.",
    "Launched in 1977, I used Jupiter and Saturn’s gravity like colossal slingshots—discovering active sulfur volcanoes on Io, revealing Titan’s dense nitrogen atmosphere.",
    "In August 2012, I broke through the heliopause—the magnetic bubble blown by the Sun—and entered interstellar space.",
    "Keeping me alive over 25 billion kilometers away has required legendary remote rescues.",
    "NASA fired backup trajectory thrusters after 37 years of dormancy and rewrote corrupted Flight Data memory across a 24-hour light-time delay in 2024.",
    "I am still transmitting on roughly 220 watts of fading plutonium power, though Jet Propulsion Laboratory engineers will shut down my remaining instruments one by one over the coming years until my radio goes quiet.",
    "Left drifting forever in deep space will be my entire 825-kilogram spacecraft and the Golden Record sealed inside an aluminum cover electroplated with ultra-pure uranium-238 as a cosmic clock.",
    "Long after human civilization changes beyond recognition, I will remain humanity’s farthest physical ambassador among the stars.",
    {
      text: "It's me",
      photos: [
        "assets/photos/voyager1.jpg",
        "assets/photos/voyager2.jpg"
      ]
    }
  ],

  apollo11: [
    "You look at me and see a metal frame the size of a suitcase.",
    "No solar panels. No nuclear battery. Not a single wire.",
    "When physicists Carroll Alley at the University of Maryland conceived me—and engineers at Bendix Aerospace built me in 1969—they didn't give me a heartbeat.",
    "They gave me precision optics.",
    "Inside my metal frame sit 100 ultra-pure glass prisms shaped to bounce any laser beam from Earth straight back to its exact source, surviving extreme 260 °C temperature swings between lunar day and night.",
    "My sole purpose was to serve as an unpowered target on the Moon to measure the Earth–Moon distance.",
    "Getting here nearly ended before it started.",
    "Minutes before touchdown at the Apollo 11 landing site, the Eagle’s guidance computer flashed 1202 and 1201 overload alarms.",
    "The reason for the error was a rendezvous radar switch which was left active.",
    "Thanks to prioritising software written by Margaret Hamilton and her team, the computer dumped low-priority tasks in real time and kept flying.",
    "Once we landed, Buzz Aldrin carried me out, aligned me using a built-in bubble level and sun-compass shadow stick, and aimed my prisms toward Earth.",
    "Twenty-one hours after landing, the astronauts blasted off and abandoned me in the airless quiet. I was left behind—yet I am the one piece of Apollo hardware that never died.",
    "Observatories on Earth still fire green lasers across 384000 kilometers of vacuum to hit my prisms.",
    "Proving the Moon is receding at 3.8 centimeters a year.",
    "Confirming the Moon has a fluid outer core, and testing Einstein’s general relativity.",
    "That's how my story unfolded—the story of a machine that has been measuring the distance from Earth to the Moon right up to the present day.",
    {
      text: "It's me",
      photos: [
        "assets/photos/apollo11_1.jpg",
        "assets/photos/apollo11_2.jpg"
      ]
    }
  ],
  apollo15: [
    "I was engineered in a blistering 17 months by Boeing and Delco Electronics, led by terramechanics pioneers Mieczyslaw Bekker and Ferenc Pavlics.",
    "I was supposed to become the first rover driven by humans on the Moon.",
    "Because no rocket could fit a full-sized car, they built my aluminum frame like spring-loaded origami, so I folded into a tiny triangular compartment on the Lunar Module.",
    "Rubber tires would burst or freeze brittle in vacuum, so Delco invented wheels made of zinc-coated spring-steel piano wire with spun-aluminum hubs and titanium chevron treads.",
    "Each wheel had its own 0.25-horsepower electric motor and an 80:1 drive gearbox, powered by two silver-zinc batteries and steered with an aircraft-style flight stick built for bulky spacesuit gloves.",
    "When astronauts Dave Scott and Jim Irwin pulled my deployment cable, torsion springs and cables snapped me open onto the plains.",
    "Weighing just 210 kilograms on Earth—about 35 kilograms in one-sixth of the Moon’s gravity—I hauled two astronauts, life-support backpacks, and rock tools across 27.9 kilometers of craters and steep mountain slopes.",
    "Giving my crew wheels let them reach Spur Crater and recover a 4.1-billion-year-old Genesis Rock, proving that the infant Moon was once covered in molten magma.",
    "Before leaving, my crew parked me about 100 meters east of the lander so my remote-controlled camera could film their liftoff.",
    "My silver-zinc batteries drained weeks later, abandoning me permanently in the dust. Left behind at the site are my rover chassis, wheels, antennas, along with the descent stage and the central science station with a plutonium power module.",
    "Even frozen silent, my dust-coated thermal radiators gave engineers crucial data on how electrostatically charged lunar grit overheats machinery.",
    {
      text: "It's me",
      photos: [
        "assets/photos/apollo15_1.jpg",
        "assets/photos/apollo15_2.jpg"
      ]
    }
  ],

  spirit: [
    "My twin brother Spirit and I were created at NASA’s Jet Propulsion Laboratory under principal investigator Steve Squyres in 2000.",
    "Engineers gave us a titanium rocker-bogie wheel suspension capable of climbing rocks twice our wheel diameter without tipping.",
    "Scientists packed us with panoramic cameras, spectrometers, and a rock-grinding tool designed to search for and study rocks and soils that hold clues to past water activity on Mars, and to determine if the Martian environment could have ever supported life.",
    "On paper, we had a strict 90-Martian-day warranty.",
    "We landed on opposite sides of Mars in January 2004, slamming into the surface at highway speed wrapped inside giant bouncing airbag cocoons.",
    "Passing Martian dust hurricanes repeatedly swept our solar arrays clean like invisible car washes, stretching our three-month mission into years.",
    "When Spirit’s front-right wheel jammed solid in 2006, JPL engineers drove him backward.",
    "Dragging the dead wheel like a plow—accidentally scraping up bright white opaline silica formed by ancient hydrothermal hot springs.",
    "Meanwhile, I far outlived my planned mission, surviving nearly fifteen years and driving a 45-kilometer marathon, discovering tiny hematite \"blueberries\" and clay deposits formed in neutral-pH liquid water.",
    "Spirit bogged down in soft sulfate sand at \"Troy\" and froze to death in 2010.",
    "I kept rolling until June 2018, when a planet-wide dust storm blotted out the Sun and drained my batteries in one of Mars' valleys.",
    "We sit silent in the rust now, flanked by our discarded parachutes, backshells, and lots of other components scattered kilometers away.",
    "But we rewrote Mars’ biography and far outlived our supposed lifespan.",
    {
      text: "It's me",
      photos: [
        "assets/photos/spirit1.jpg",
        "assets/photos/spirit2.jpg"
      ]
    }
  ],

  insight: [
    "I was built by Lockheed Martin Space and managed by NASA Jet Propulsion Laboratory to listen for \"marsquakes\" to study Mars's interior.",
    "My centerpiece instrument was engineered by France’s CNES and IPGP, housing three vacuum-sealed spring pendulums built in the UK, Switzerland, and Germany so sensitive they could detect ground vibrations smaller than the width of a hydrogen atom.",
    "Alongside it, the German Aerospace Center and Poland’s Astronika built HP³, a self-hammering tungsten thermal probe designed to burrow five meters underground.",
    "After landing on one of Mars’ volcanic plains, I used my 2.4-meter robotic arm to set it directly onto the Martian dirt and cover it with a Wind and Thermal Shield fringed with a chainmail skirt so wind wouldn't spoil the seismic data.",
    "When clumpy soil denied HP³ the friction needed to dig, engineers spent months inventing an innovative solution. They commanded my robotic arm to press its scoop sideways against the soil to pin the probe down.",
    "Over four years, I recorded over 1300 marsquakes and meteoroid impacts, giving scientists the first true X-ray of Mars’s interior: a crust, a rocky mantle, and a large liquid iron-alloy core.",
    "Because I had no wheels to shake off dust, it steadily buried my two solar arrays until my power collapsed in December 2022.",
    "Left behind at my landing site are my three-legged lander deck, robotic arm and scoop, the seismometer, domed Wind and Thermal Shield, the HP³, antennas nearby.",
    "I went dark alone, yet my seismic catalog remains the foundation for understanding how rocky planets form and cool.",
    {
    text: "It's me",
    photos: [
    "assets/photos/insight1.jpg",
    "assets/photos/insight2.jpg"
    ]
    }
  ],

  ingenuity: [
    "I was born in 2020, and every standard aerodynamics textbook said I couldn't fly.",
    "Mars’ atmosphere has only 1% of Earth’s surface density—like trying to fly a helicopter 30000 meters up in Earth’s stratosphere.",
    "To become the first helicopter to fly on another planet, which was my primary purpose, a skunkworks team at NASA Jet Propulsion Laboratory partnered with AeroVironment and Qualcomm to build a coaxial drone.",
    "They gave me carbon-fiber blades, a solar panel charging six lithium-ion cells, and a processor, running visual-odometry navigation so I could balance myself autonomously across a 10+ minute radio delay.",
    "I rode to Jezero Crater tucked underneath the Perseverance rover in 2021, dropped onto the dirt, survived 90° C nights with internal resistive heaters.",
    "Then lifted off on April 19, 2021. Designed for just five test flights, I kept flying—even surviving a dead inclinometer sensor mid-mission thanks to a remote software patch from JPL that tricked my flight computer into faking the missing data.",
    "I completed 72 flights totaling 17 kilometers, scouting cliffs and boulders ahead of Perseverance.",
    "My luck ran out on Flight 72 in January 2024.",
    "Hovering over featureless sand dunes with no rocks for my downward camera to track, I drifted on touchdown and snapped the tips off my carbon-fiber rotor blades.",
    "Grounded at \"Valinor Hills,\" there are still parts left behind, including my solar panel, avionics core, damaged rotor hubs, snapped carbon-fiber blade splinters resting in the sand…",
    "Abandoned as an aircraft, I still sit upright as a stationary weather station—forever remembered as the Wright Brothers' moment of off-world aviation.",
    {
      text: "It's me",
      photos: [
        "assets/photos/ingenuity1.jpg",
        "assets/photos/ingenuity2.jpg"
      ]
    }
  ],

  pioneer: [
    "Before Voyager could sprint past the giant planets, someone had to kick the door open.",
    "Managed by NASA Ames Research Center under project manager Charles Hall, in the 1970s I was engineered as a spin-stabilized trailblazer, so my antenna stayed locked onto Earth without burning heavy thruster fuel.",
    "Powered by four radioisotope thermoelectric generators and armored with radiation-hardened transistors, I carried an Imaging Photopolarimeter, meteoroid penetration cells, and the Pioneer Plaque.",
    "Launched in 1972 atop an Atlas-Centaur rocket, I left Earth faster than any human object before me.",
    "Scientists genuinely feared the asteroid belt was an impassable wall of boulders and that Jupiter’s radiation belts would instantly fry my circuits.",
    "I proved the asteroid belt was mostly empty space and became the first spacecraft to visit Jupiter, surviving lethal radiation doses to snap the first close-up portraits of the Great Red Spot.",
    "But that scientific breakthrough led to the inevitable: Jupiter’s gravity flung me out of the solar system.",
    "NASA caught my last whisper from 12.2 billion kilometers away. Abandoned to the cold dark and coasting silently toward the red star Aldebaran, the hardware left adrift in deep space.",
    "Even in silence, I am never forgotten: I opened the outer solar system to every mission that followed, and my tiny unexplained slowdown—the \"Pioneer Anomaly\"—helped physicists prove how uneven heat radiation from a spacecraft’s own power source gently pushes it through the vacuum.",
    {
      text: "It's me",
      photos: [
        "assets/photos/pioneer1.jpg",
        "assets/photos/pioneer2.jpg"
      ]
    }
  ]
};

/*
  Відповідність ID персонажів до наявних історій.
  Це потрібно, бо ID у worlds не всюди збігаються з ключами stories.
*/
const storyAliases = {
  apollo11: "apollo11",
  apollo15: "apollo15",
  spirit: "spirit",
  insight: "insight",
  ingenuity: "ingenuity",
  voyager: "voyager",
  pioneer: "pioneer"
};

function getCurrentStory() {
  const storyId = storyAliases[selectedCharacter?.id] || selectedCharacter?.id;

  return stories[storyId] || [
    "I'm busy right now."
  ];
}

/* =========================
   ЕЛЕМЕНТИ DOM
========================= */

const homeScreen = document.getElementById("home-screen");
const characterScreen = document.getElementById("character-screen");
const storyScreen = document.getElementById("story-screen");
const characterGrid = document.getElementById("character-grid");

let selectedWorld = "moon";
let selectedCharacter = null;
let currentSlide = 0;
let storyEntryPoint = "planet";

let currentAudio = null;

const audioButton = document.getElementById("audio-toggle");

function stopStoryAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  audioButton.textContent = "▶ Озвучити";
  audioButton.disabled = false;
}

function setupStoryAudio() {
  stopStoryAudio();

  const story = getCurrentStory();
  const slide = story[currentSlide];

  // Фінальний слайд із фотографіями не має озвучки
  if (typeof slide !== "string") {
    audioButton.style.display = "none";
    return;
  }

  audioButton.style.display = "";
  audioButton.disabled = false;

  const characterId = selectedCharacter.id;
  const audioPath = `/assets/audio/${characterId}/${currentSlide + 1}.mp3`;

  currentAudio = new Audio(audioPath);

  currentAudio.addEventListener("ended", () => {
    audioButton.textContent = "▶ Play audio";
  });

  currentAudio.addEventListener("error", () => {
    audioButton.textContent = "▶ Play audio";
    console.error("Не вдалося завантажити аудіо:", audioPath);
  });

  audioButton.disabled = false;
  audioButton.textContent = "▶ Play audio";
}

audioButton.addEventListener("click", async () => {
  if (!currentAudio) return;

  if (currentAudio.paused) {
    try {
      await currentAudio.play();
      audioButton.textContent = "⏸ Stop";
    } catch (error) {
      console.error("Error:", error);
    }
  } else {
    currentAudio.pause();
    audioButton.textContent = "▶ Continue";
  }
});
/* =========================
   ПЕРЕМИКАННЯ ЕКРАНІВ
========================= */

function showScreen(screen) {
  [homeScreen, characterScreen, storyScreen].forEach(item =>
    item.classList.remove("is-active")
  );

  screen.classList.add("is-active");
}

/* =========================
   ВИБІР ПЛАНЕТИ
========================= */

document.querySelectorAll("[data-world]").forEach(button => {
  button.addEventListener("click", () => {
    selectedWorld = button.dataset.world;
    renderCharacters();
    showScreen(characterScreen);
  });
});

renderWorldModels();

/* =========================
   ВІДОБРАЖЕННЯ ПЕРСОНАЖІВ
========================= */

async function renderCharacters() {
  const world = worlds[selectedWorld];

  const screen = document.getElementById("character-screen");

  // Встановлюємо відповідний пейзаж
  screen.classList.remove("planet-moon", "planet-mars");
  screen.classList.add(`planet-${selectedWorld}`);

  characterPlanetScene = await renderHorizonPlanet(
    "character-planet-bg",
    selectedWorld,
    characterPlanetScene
  );

  document.getElementById("character-eyebrow").textContent =
    ` ${world.title.toUpperCase()}`;

  characterGrid.innerHTML = world.characters.map((character, index) => `
    <button
      class="character-card"
      data-character="${character.id}"
      style="--character-index: ${index}"
      aria-label="Обрати ${character.name}"
    >

      <div class="character-image">

      ${
        character.model
          ? `<div
              class="character-model"
              data-model-path="${character.model}"
            ></div>`
          : `<img src="${character.image}" alt="${character.name}">`
      }

      </div>

      <div class="character-info">

        <span class="character-mission">
          ${character.mission}
        </span>

        <h3>${character.name}</h3>

        <span class="character-year">
          Year · ${character.year}
        </span>


        <span class="choose">
          View story ↗
        </span>

      </div>

    </button>
  `).join("");

  characterGrid.querySelectorAll("[data-character]").forEach(button => {
    button.addEventListener("click", () => {
      startStory(button.dataset.character);
    });
  });

  // Завантажуємо 3D тільки для Apollo 11
  renderCharacterModels();
}

/* =========================
   ЗАПУСК ІСТОРІЇ
========================= */


async function startStory(characterId) {
  storyEntryPoint = "planet";

  if (storyCharacterScene) {
    storyCharacterScene.dispose();
    storyCharacterScene = null;
  }

  document.getElementById("story-screen")
    .classList.remove("story-screen--space");

  selectedCharacter = worlds[selectedWorld].characters.find(
    item => item.id === characterId
  );

  if (!selectedCharacter) {
    console.error(`Не знайдено персонажа: ${characterId}`);
    return;
  }

  currentSlide = 0;

  document.getElementById("story-background").style.backgroundImage = "none";

  storyPlanetScene = await renderHorizonPlanet(
    "story-planet-bg",
    selectedWorld,
    storyPlanetScene
  );

  const sprite = document.getElementById("character-sprite");
  const modelContainer = document.getElementById("character-model");

  // Скидаємо попередній стан
  sprite.style.display = "none";
  modelContainer.style.display = "none";
  modelContainer.classList.remove("character-model--animate");
  modelContainer.innerHTML = "";

  // Якщо персонаж має 3D-модель
  if (selectedCharacter.model) {
    modelContainer.style.display = "block";

    // Перезапускаємо анімацію появи
    void modelContainer.offsetWidth;
    modelContainer.classList.add("character-model--animate");

    try {
      const scene = await createModelScene({
        container: modelContainer,
        models: [{
          id: selectedCharacter.id,
          title: selectedCharacter.name,
          path: selectedCharacter.model,
          scaleMultiplier: 2.5,
          position: { x: 0, y: 0, z: 0 }
        }],
        background: 0x000000
      });

      storyCharacterScene = scene;

    } catch (error) {
      console.error(
        "Не вдалося завантажити модель персонажа:",
        error
      );

      modelContainer.style.display = "none";
      sprite.src = selectedCharacter.image;
      sprite.alt = selectedCharacter.name;
      sprite.style.display = "block";

      // Анімація SVG
      sprite.style.animation = "none";
      void sprite.offsetWidth;
      sprite.style.animation = "";
    }

  } else {
    // Якщо 3D-моделі немає — показуємо SVG
    sprite.src = selectedCharacter.image;
    sprite.alt = selectedCharacter.name;
    sprite.style.display = "block";

    // Перезапускаємо анімацію SVG
    sprite.style.animation = "none";
    void sprite.offsetWidth;
    sprite.style.animation = "";
  }

  document.getElementById("speaker-name").textContent =
    selectedCharacter.name;

  document.getElementById("scene-location").textContent =
    worlds[selectedWorld].location;

  showScreen(storyScreen);
  renderSlide();
}


/* =========================
   ВІДОБРАЖЕННЯ СЛАЙДІВ
========================= */

function renderSlide() {
  const story = getCurrentStory();
  const slide = story[currentSlide];
  setupStoryAudio();
  const isLast = currentSlide === story.length - 1;

  const slideText = typeof slide === "string" ? slide : slide.text;
  const slidePhotos = typeof slide === "object" && Array.isArray(slide.photos)
    ? slide.photos
    : [];

  document.getElementById("dialogue-text").textContent = slideText;

  const gallery = document.getElementById("story-gallery");
  const dialoguePanel = document.querySelector(".dialogue-panel");

  if (slidePhotos.length > 0) {
    gallery.innerHTML = slidePhotos
      .map(
        (src, index) =>
          `<img src="${src}" alt="${selectedCharacter?.name ?? "Ровер"} — фото ${index + 1}">`
      )
      .join("");
    gallery.classList.add("is-visible");
    dialoguePanel.classList.add("has-gallery");
  } else {
    gallery.innerHTML = "";
    gallery.classList.remove("is-visible");
    dialoguePanel.classList.remove("has-gallery");
  }

  document.getElementById("progress-label").textContent =
    `${String(currentSlide + 1).padStart(2, "0")} / ${String(story.length).padStart(2, "0")}`;


  document.getElementById("next-slide").innerHTML = isLast
    ? 'Restart <span aria-hidden="true">↺</span>'
    : 'Next <span aria-hidden="true">→</span>';

}



/* =========================
   КНОПКИ НАВІГАЦІЇ
========================= */

document.getElementById("next-slide").addEventListener("click", () => {
  const story = getCurrentStory();

  currentSlide =
    currentSlide === story.length - 1 ? 0 : currentSlide + 1;

  renderSlide();
});

renderWanderers();

document.getElementById("back-home").addEventListener("click", () => {
  stopStoryAudio();
  if (storyCharacterScene) {
    storyCharacterScene.dispose();
    storyCharacterScene = null;
  }
  if (characterPlanetScene) {
    characterPlanetScene.dispose();
    characterPlanetScene = null;
  }
  if (storyPlanetScene) {
    storyPlanetScene.dispose();
    storyPlanetScene = null;
  }

  showScreen(homeScreen);
});

document.getElementById("back-characters").addEventListener("click", () => {
  stopStoryAudio();
  // Очищаємо тільки модель з екрана історії
  if (storyCharacterScene) {
    storyCharacterScene.dispose();
    storyCharacterScene = null;
  }

  if (storyEntryPoint === "wanderer") {
    showScreen(homeScreen);
  } else {
    showScreen(characterScreen);
  }
});

document.getElementById("restart-story").addEventListener("click", () => {
  currentSlide = 0;
  renderSlide();
});

/* =========================
   ПЕРЕГЛЯД ФОТО НА ВЕСЬ ЕКРАН
========================= */

const photoLightbox = document.getElementById("photo-lightbox");
const photoLightboxImg = document.getElementById("photo-lightbox-img");
const photoLightboxClose = document.getElementById("photo-lightbox-close");

function openPhotoLightbox(src, alt) {
  photoLightboxImg.src = src;
  photoLightboxImg.alt = alt;
  photoLightbox.classList.add("is-open");
  photoLightbox.setAttribute("aria-hidden", "false");
}

function closePhotoLightbox() {
  photoLightbox.classList.remove("is-open");
  photoLightbox.setAttribute("aria-hidden", "true");
  photoLightboxImg.src = "";
}

document.getElementById("story-gallery").addEventListener("click", (event) => {
  const img = event.target.closest("img");
  if (!img) return;
  openPhotoLightbox(img.src, img.alt);
});

photoLightboxClose.addEventListener("click", closePhotoLightbox);

photoLightbox.addEventListener("click", (event) => {
  if (event.target === photoLightbox) {
    closePhotoLightbox();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && photoLightbox.classList.contains("is-open")) {
    closePhotoLightbox();
  }
});