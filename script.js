import { createModelScene } from "./scene3d.js";

const worlds = {
  moon: {
    title: "Місяць",
    location: "МІСЯЦЬ · МОРЕ СПОКОЮ",
    background: "assets/moon.svg",
    characters: [
      {
        id: "apollo-11",
        name: "Apollo 11",
        mission: "Lunokhod-1",
        year: "1970",
        description: "Перший успішний місяцехід. Досліджував поверхню Місяця та передавав панорамні знімки.",
        image: "assets/rover-moon.svg",
        model: "/assets/models/rovers/apollo11.glb"
      },
      {
        id: "apollo-15",
        name: "Apollo 15",
        mission: "Apollo 15",
        year: "1971",
        description: "Місячний автомобіль, який допомагав астронавтам досліджувати віддалені ділянки поверхні.",
        image: "assets/rover-moon-2.svg",
        model: "/assets/models/rovers/apollo15.glb"
      }
    ]
  },

  mars: {
    title: "Марс",
    location: "МАРС · КРАТЕР ЄЗЕРО",
    background: "assets/mars.svg",
    characters: [
      {
        id: "spirit",
        name: "Spirit",
        mission: "Mars Science Laboratory",
        year: "2011",
        description: "Досліджує марсіанські породи та шукає свідчення того, що колись на Марсі існувало життя.",
        image: "assets/rover-mars.svg",
        model: "/assets/models/rovers/spirit.glb"
      },
      {
        id: "insight",
        name: "inSight",
        mission: "Mars 2020",
        year: "2020",
        description: "Досліджує геологію Марса та збирає зразки порід для майбутнього повернення на Землю.",
        image: "assets/rover-mars-2.svg"
      },
      {
        id: "ingenuity",
        name: "Ingenuity",
        mission: "Mars 2020",
        year: "2020",
        description: "Досліджує геологію Марса та збирає зразки порід для майбутнього повернення на Землю.",
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
    name: "Voyager",
    role: "Самотній мандрівник",
    description: "Залишився далеко від своєї експедиції.",
    image: "assets/rover-mars.svg",
    world: "mars",
    location: "МАРС · ВІДДАЛЕНА ДІЛЯНКА"
  },
  {
    id: "pioneer",
    name: "Pioneer",
    role: "Дослідник сигналів",
    description: "Намагається відновити зв'язок із Землею.",
    image: "assets/rover-moon-2.svg",
    world: "moon",
    location: "МІСЯЦЬ · НЕВІДОМИЙ СЕКТОР",
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
          position: { x: 0, y: 0, z: 0 }
        }],
        background: 0x17191d
      });

      characterScenes.set(container, scene);

    } catch (error) {
      console.error(
        `Помилка завантаження моделі ${modelPath}:`,
        error
      );
    }
  }
}

/* =========================
   МАНДРІВНИКИ
========================= */

function renderWanderers() {
  const container = document.getElementById("wanderers");

  if (!container) return;
  if (container.children.length > 0) return;

  // Заборонені зони навколо планет
  const forbiddenZones = [
    {
      left: 20,
      right: 48,
      top: 25,
      bottom: 85
    },
    {
      left: 52,
      right: 80,
      top: 25,
      bottom: 85
    }
  ];

  // Мінімальна відстань між роверами у відсотках
  const minDistance = 30;

  // Тут зберігаємо координати вже розміщених роверів
  const placedPositions = [];

  function getRandomPosition() {
    let attempts = 0;

    while (attempts < 500) {
      const left = 3 + Math.random() * 90;
      const top = 10 + Math.random() * 75;

      attempts++;

      // Перевіряємо, чи не потрапив ровер на планету
      const insidePlanetZone = forbiddenZones.some(zone =>
        left >= zone.left &&
        left <= zone.right &&
        top >= zone.top &&
        top <= zone.bottom
      );

      if (insidePlanetZone) continue;

      // Перевіряємо відстань до інших роверів
      const tooClose = placedPositions.some(position => {
        const dx = left - position.left;
        const dy = top - position.top;

        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance < minDistance;
      });

      if (tooClose) continue;

      // Якщо всі перевірки пройдені — зберігаємо позицію
      const newPosition = { left, top };

      placedPositions.push(newPosition);

      return newPosition;
    }

    // Якщо вільного місця не знайшлося
    console.warn("Не вдалося знайти вільне місце для ровера");

    return null;
  }

  wanderers.forEach((character, index) => {
    const position = getRandomPosition();

    // Не створюємо персонажа, якщо місця немає
    if (!position) return;

    const button = document.createElement("button");

    button.className = "wanderer";
    if (character.model) {
      button.classList.add("wanderer--3d");
    }

    button.style.left = `${position.left}%`;
    button.style.top = `${position.top}%`;

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
    // Не завантажуємо модель повторно
    if (container.dataset.loaded === "true") continue;

    const modelPath = container.dataset.modelPath;

    try {
      const scene = await createModelScene({
        container,
        models: [
          {
            id: modelPath,
            title: "Pioneer",
            path: modelPath,
            scaleMultiplier: 8,
            cameraFill: 0.85,
            position: {
              x: 0,
              y: 0,
              z: 0
            }
          }
        ],
        background: 0x000000
      });

      wandererScenes.set(container, scene);
      container.dataset.loaded = "true";

    } catch (error) {
      console.error(`Не вдалося завантажити ${modelPath}:`, error);
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

  if (storyCharacterScene) {
    storyCharacterScene.dispose();
    storyCharacterScene = null;
  }

  document.getElementById("story-screen")
    .classList.add("story-screen--space");

  const sprite = document.getElementById("character-sprite");
  const modelContainer = document.getElementById("character-model");
  const photo = document.getElementById("story-photo");

  photo.style.display = "none";
  sprite.style.display = "none";
  modelContainer.style.display = "none";
  modelContainer.innerHTML = "";
  modelContainer.classList.remove("character-model--animate");

  if (character.model) {
    modelContainer.style.display = "block";

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
      console.error("Не вдалося завантажити модель:", error);

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
  
  apollo11: [
    // I. BIRTH
    { chapter: "I. BIRTH", text: "You look at me and see a metal frame the size of a suitcase." },
    { chapter: "I. BIRTH", text: "No solar panels. No nuclear battery. Not a single wire." },
    { chapter: "I. BIRTH", text: "When physicists Carroll Alley at the University of Maryland conceived me—and engineers at Bendix Aerospace built me in 1969—they didn't give me a heartbeat." },
    { chapter: "I. BIRTH", text: "They gave me precision optics." },
    { chapter: "I. BIRTH", text: "Inside my metal frame sit 100 ultra-pure glass prisms shaped to bounce any laser beam from Earth straight back to its exact source, surviving extreme 260 °C temperature swings between lunar day and night." },
    { chapter: "I. BIRTH", text: "My sole purpose was to serve as an unpowered target on the Moon to measure the Earth–Moon distance." },

    // II. LIFE
    { chapter: "II. LIFE", text: "Getting here nearly ended before it started." },
    { chapter: "II. LIFE", text: "Minutes before touchdown at the Apollo 11 landing site, the Eagle’s guidance computer flashed 1202 and 1201 overload alarms." },
    { chapter: "II. LIFE", text: "The reason for the error was a rendezvous radar switch which was left active." },
    { chapter: "II. LIFE", text: "Thanks to prioritising software written by Margaret Hamilton and her team, the computer dumped low-priority tasks in real time and kept flying." },
    { chapter: "II. LIFE", text: "Once we landed, Buzz Aldrin carried me out, aligned me using a built-in bubble level and sun-compass shadow stick, and aimed my prisms toward Earth." },

    // III. DEATH
    { chapter: "III. DEATH", text: "Twenty-one hours after landing, the astronauts blasted off and abandoned me in the airless quiet. I was left behind—yet I am the one piece of Apollo hardware that never died." },
    { chapter: "III. DEATH", text: "Observatories on Earth still fire green lasers across 384000 kilometers of vacuum to hit my prisms." },
    { chapter: "III. DEATH", text: "Proving the Moon is receding at 3.8 centimeters a year." },
    { chapter: "III. DEATH", text: "Confirming the Moon has a fluid outer core, and testing Einstein’s general relativity." },
    { chapter: "III. DEATH", text: "That's how my story unfolded—the story of a machine that has been measuring the distance from Earth to the Moon right up to the present day." },

    // 17. PHOTO
    {
      type: "image",
      chapter: "MISSION ARCHIVE",
      image: "assets/photos/apollo11.jpg"
    }
  ],

  apollo15: [
    // I. BIRTH
    {
      chapter: "I. BIRTH",
      text: "I was engineered in a blistering 17 months by Boeing and Delco Electronics, led by terramechanics pioneers Mieczyslaw Bekker and Ferenc Pavlics."
    },
    {
      chapter: "I. BIRTH",
      text: "I was supposed to become the first rover driven by humans on the Moon."
    },
    {
      chapter: "I. BIRTH",
      text: "Because no rocket could fit a full-sized car, they built my aluminum frame like spring-loaded origami, so I folded into a tiny triangular compartment on the Lunar Module."
    },
    {
      chapter: "I. BIRTH",
      text: "Rubber tires would burst or freeze brittle in vacuum, so Delco invented wheels made of zinc-coated spring-steel piano wire with spun-aluminum hubs and titanium chevron treads."
    },
    {
      chapter: "I. BIRTH",
      text: "Each wheel had its own 0.25-horsepower electric motor and an 80:1 drive gearbox, powered by two silver-zinc batteries and steered with an aircraft-style flight stick built for bulky spacesuit gloves."
    },

    // II. LIFE
    {
      chapter: "II. LIFE",
      text: "When astronauts Dave Scott and Jim Irwin pulled my deployment cable, torsion springs and cables snapped me open onto the plains."
    },
    {
      chapter: "II. LIFE",
      text: "Weighing just 210 kilograms on Earth—about 35 kilograms in one-sixth of the Moon’s gravity—I hauled two astronauts, life-support backpacks, and rock tools across 27.9 kilometers of craters and steep mountain slopes."
    },
    {
      chapter: "II. LIFE",
      text: "Giving my crew wheels let them reach Spur Crater and recover a 4.1-billion-year-old Genesis Rock, proving that the infant Moon was once covered in molten magma."
    },

    // III. DEATH
    {
      chapter: "III. DEATH",
      text: "Before leaving, my crew parked me about 100 meters east of the lander so my remote-controlled camera could film their liftoff."
    },
    {
      chapter: "III. DEATH",
      text: "My silver-zinc batteries drained weeks later, abandoning me permanently in the dust. Left behind at the site are my rover chassis, wheels, antennas, along with the descent stage and the central science station with a plutonium power module."
    },
    {
      chapter: "III. DEATH",
      text: "Even frozen silent, my dust-coated thermal radiators gave engineers crucial data on how electrostatically charged lunar grit overheats machinery."
    },
    // PHOTO
    {
      type: "image",
      chapter: "MISSION ARCHIVE",
      image: "assets/photos/apollo15.jpg"
    }
  ],
  spirit: [
    // I. BIRTH
    {
      chapter: "I. BIRTH",
      text: "My twin brother Spirit and I were created at NASA’s Jet Propulsion Laboratory under principal investigator Steve Squyres in 2000."
    },
    {
      chapter: "I. BIRTH",
      text: "Engineers gave us a titanium rocker-bogie wheel suspension capable of climbing rocks twice our wheel diameter without tipping."
    },
    {
      chapter: "I. BIRTH",
      text: "Scientists packed us with panoramic cameras, spectrometers, and a rock-grinding tool designed to search for and study rocks and soils that hold clues to past water activity on Mars, and to determine if the Martian environment could have ever supported life."
    },
    {
      chapter: "I. BIRTH",
      text: "On paper, we had a strict 90-Martian-day warranty."
    },

    // II. LIFE
    {
      chapter: "II. LIFE",
      text: "We landed on opposite sides of Mars in January 2004, slamming into the surface at highway speed wrapped inside giant bouncing airbag cocoons."
    },
    {
      chapter: "II. LIFE",
      text: "Passing Martian dust hurricanes repeatedly swept our solar arrays clean like invisible car washes, stretching our three-month mission into years."
    },
    {
      chapter: "II. LIFE",
      text: "When Spirit’s front-right wheel jammed solid in 2006, JPL engineers drove him backward."
    },
    {
      chapter: "II. LIFE",
      text: "Dragging the dead wheel like a plow—accidentally scraping up bright white opaline silica formed by ancient hydrothermal hot springs."
    },
    {
      chapter: "II. LIFE",
      text: "Meanwhile, I far outlived my planned mission, surviving nearly fifteen years and driving a 45.16-kilometer marathon, discovering tiny hematite 'blueberries' and clay deposits formed in neutral-pH liquid water."
    },

    // III. DEATH
    {
      chapter: "III. DEATH",
      text: "Spirit bogged down in soft sulfate sand at 'Troy' and froze to death in 2010."
    },
    {
      chapter: "III. DEATH",
      text: "I kept rolling until June 2018, when a planet-wide dust storm blotted out the Sun and drained my batteries in one of Mars' valleys."
    },
    {
      chapter: "III. DEATH",
      text: "We sit silent in the rust now, flanked by our discarded parachutes, backshells, and lots of other components scattered kilometers away."
    },
    {
      chapter: "III. DEATH",
      text: "But we rewrote Mars’ biography and far outlived our supposed lifespan."
    }
],

  curiosity: [
    "Мій маніпулятор трохи скрипить, але працює. Для робота це майже те саме, що прокинутися з гарним настроєм.",
    "Десь далеко залишилися люди, які зібрали мене по гвинтику. Цікаво, чи дивляться вони зараз на Марс.",
    "Я підняв камеру й зробив панораму. Пейзаж суворий, але в ньому є дивна краса.",
    "Система повідомляє про зниження заряду. Я вимикаю другорядні модулі й залишаю активним журнал.",
    "Якщо це мій останній запис, нехай він буде про цікавість. Саме вона привела мене сюди."
  ],

  voyager: [
    "Я більше не бачу інших роверів. Лише темний горизонт і слабке світло Землі.",
    "Мою експедицію завершили, але ніхто не надіслав команду вимкнення.",
    "Я продовжую рух. Можливо, десь попереду є хтось, хто ще чекає на мене.",
    "Сьогодні я отримав дивний сигнал. Він дуже схожий на людський голос.",
    "Я вирушаю назустріч сигналу. Можливо, я нарешті не сам."
  ],

  echo: [
    "Мій передавач працює, але відповіді немає.",
    "Щодня я надсилаю повідомлення на Землю. Щодня отримую тільки тишу.",
    "Сьогодні я почув відлуння власного сигналу.",
    "Хтось або щось повторює мої повідомлення.",
    "Я продовжуватиму слухати. Можливо, одного дня мені відповідять."
  ]
};

/*
  Відповідність ID персонажів до наявних історій.
  Це потрібно, бо ID у worlds не всюди збігаються з ключами stories.
*/
const storyAliases = {
  "apollo-11": "apollo11",
  "apollo-15": "apollo15",
  "spirit": "spirit",
  insight: "insight",
  ingenuity: "ingenuity",
  voyager: "voyager",
  pioneer: "pioneer"
};

function getCurrentStory() {
  const storyId = storyAliases[selectedCharacter?.id] || selectedCharacter?.id;

  return stories[storyId] || [
    "Я продовжую дослідження. Мій журнал усе ще записує кожен новий сигнал."
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

/* =========================
   ВІДОБРАЖЕННЯ ПЕРСОНАЖІВ
========================= */

function renderCharacters() {
  const world = worlds[selectedWorld];

  const screen = document.getElementById("character-screen");

  // Встановлюємо відповідний пейзаж
  screen.classList.remove("planet-moon", "planet-mars");
  screen.classList.add(`planet-${selectedWorld}`);

  document.getElementById("character-eyebrow").textContent =
    `МІСЦЕ ПРИЗНАЧЕННЯ · ${world.title.toUpperCase()}`;

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
          РІК МІСІЇ · ${character.year}
        </span>

        <p>${character.description}</p>

        <span class="choose">
          ПЕРЕГЛЯНУТИ ІСТОРІЮ ↗
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

  document.getElementById("story-background").style.backgroundImage =
    `url("${worlds[selectedWorld].background}")`;

  const sprite = document.getElementById("character-sprite");
  const modelContainer = document.getElementById("character-model");
  const photo = document.getElementById("story-photo");

  photo.style.display = "none";
  sprite.style.display = "none";
  modelContainer.style.display = "none";
  modelContainer.classList.remove("character-model--animate");
  modelContainer.innerHTML = "";

  if (selectedCharacter.model) {
    modelContainer.style.display = "block";

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
      console.error("Не вдалося завантажити модель:", error);

      modelContainer.style.display = "none";
      sprite.src = selectedCharacter.image;
      sprite.alt = selectedCharacter.name;
      sprite.style.display = "block";
    }

  } else {
    sprite.src = selectedCharacter.image;
    sprite.alt = selectedCharacter.name;
    sprite.style.display = "block";
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

  if (!slide) {
    console.error("Слайд не знайдено:", currentSlide);
    return;
  }

  const sprite = document.getElementById("character-sprite");
  const modelContainer = document.getElementById("character-model");
  const photo = document.getElementById("story-photo");

  const dialogueText = document.getElementById("dialogue-text");
  const progressLabel = document.getElementById("progress-label");
  const chapterLabel = document.getElementById("chapter-label");
  const nextButton = document.getElementById("next-slide");

  if (!dialogueText || !progressLabel || !chapterLabel || !nextButton) {
    console.error("Не знайдено елементи історії:", {
      dialogueText,
      progressLabel,
      chapterLabel,
      nextButton
    });
    return;
  }

  const isObjectSlide = typeof slide === "object" && slide !== null;

  const isImageSlide = isObjectSlide &&
    (slide.type === "image" || Boolean(slide.image));

  const slideText = typeof slide === "string"
    ? slide
    : (slide.text || "");

  const chapter = isObjectSlide ? slide.chapter : null;
  const isLast = currentSlide === story.length - 1;

  dialogueText.textContent = slideText;

  chapterLabel.textContent =
    chapter || `РОЗДІЛ ${String(currentSlide + 1).padStart(2, "0")}`;

  progressLabel.textContent =
    `${String(currentSlide + 1).padStart(2, "0")} / ${String(story.length).padStart(2, "0")}`;

  nextButton.innerHTML = isLast
    ? 'Спочатку <span aria-hidden="true">↺</span>'
    : 'Далі <span aria-hidden="true">→</span>';

  // Фінальний слайд із фотографією
  if (isImageSlide) {
    if (sprite) sprite.style.display = "none";
    if (modelContainer) modelContainer.style.display = "none";

    if (photo) {
      photo.src = slide.image;
      photo.alt = "Фото з місії";
      photo.style.display = "block";
    }

    return;
  }

  if (photo) {
    photo.style.display = "none";
  }

  // 3D-модель
  if (selectedCharacter?.model && modelContainer) {
    modelContainer.style.display = "block";

    if (sprite) {
      sprite.style.display = "none";
    }

    modelContainer.classList.remove("character-model--animate");

    void modelContainer.offsetWidth;

    modelContainer.classList.add("character-model--animate");

  } else {
    // SVG-зображення
    if (modelContainer) {
      modelContainer.style.display = "none";
    }

    if (sprite) {
      sprite.style.display = "block";
      sprite.style.animation = "none";

      void sprite.offsetWidth;

      sprite.style.animation = "appear .7s ease both";
    }
  }
}


/* =========================
   КНОПКИ НАВІГАЦІЇ
========================= */

/* =========================
   КНОПКИ НАВІГАЦІЇ
========================= */

// Наступний слайд
document.getElementById("next-slide")?.addEventListener("click", () => {
  const story = getCurrentStory();

  currentSlide =
    currentSlide === story.length - 1
      ? 0
      : currentSlide + 1;

  renderSlide();
});


// Початкове відображення мандрівників
renderWanderers();


// Повернення з вибору персонажів на головний екран
document.getElementById("back-home")?.addEventListener("click", () => {
  showScreen(homeScreen);
});


// Повернення з історії на екран вибору або головний екран
document.getElementById("back-characters")?.addEventListener("click", () => {
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


// Безпосереднє повернення на першу сторінку меню
document.getElementById("story-back-home")?.addEventListener("click", () => {
  if (storyCharacterScene) {
    storyCharacterScene.dispose();
    storyCharacterScene = null;
  }

  showScreen(homeScreen);
});


// Почати історію спочатку
document.getElementById("restart-story")?.addEventListener("click", () => {
  currentSlide = 0;
  renderSlide();
});


