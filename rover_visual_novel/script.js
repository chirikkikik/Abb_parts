const worlds = {
  moon: {
    title: "Місяць",
    location: "МІСЯЦЬ · МОРЕ СПОКОЮ",
    background: "assets/moon.svg",
    characters: [
  {
    id: "luna",
    name: "Luna",
    mission: "Lunokhod-1",
    year: "1970",
    description: "Перший успішний місяцехід. Досліджував поверхню Місяця та передавав панорамні знімки.",
    image: "assets/rover-moon.svg"
  },
  {
    id: "apollo",
    name: "Apollo",
    mission: "Apollo 15",
    year: "1971",
    description: "Місячний автомобіль, який допомагав астронавтам досліджувати віддалені ділянки поверхні.",
    image: "assets/rover-moon-2.svg"
    }
  ]
},
  mars: {
    title: "Марс",
    location: "МАРС · КРАТЕР ЄЗЕРО",
    background: "assets/mars.svg",
    characters: [
  {
    id: "red",
    name: "Red",
    mission: "Mars Science Laboratory",
    year: "2011",
    description: "Досліджує марсіанські породи та шукає свідчення того, що колись на Марсі існувало життя.",
    image: "assets/rover-mars.svg"
  },
  {
    id: "curiosity",
    name: "Curiosity",
    mission: "Mars 2020",
    year: "2020",
    description: "Досліджує геологію Марса та збирає зразки порід для майбутнього повернення на Землю.",
    image: "assets/rover-mars-2.svg"
  },
  {
    id: "curiosity",
    name: "Curiosity",
    mission: "Mars 2020",
    year: "2020",
    description: "Досліджує геологію Марса та збирає зразки порід для майбутнього повернення на Землю.",
    image: "assets/rover-mars-2.svg"
  }
    ]
  }
};

// Персонажі, які знаходяться у відкритому космосі
const wanderers = [
  {
    id: "voyager",
    name: "Вояджер",
    role: "Самотній мандрівник",
    description: "Залишився далеко від своєї експедиції.",
    image: "assets/rover-space-1.svg",
    world: "mars",
    location: "МАРС · ВІДДАЛЕНА ДІЛЯНКА"
  },
  {
    id: "echo",
    name: "Ехо",
    role: "Дослідник сигналів",
    description: "Намагається відновити зв'язок із Землею.",
    image: "assets/rover-space-2.svg",
    world: "moon",
    location: "МІСЯЦЬ · НЕВІДОМИЙ СЕКТОР"
  }
];

function renderWanderers() {
  const container = document.getElementById("wanderers");

  container.innerHTML = "";

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

    button.style.left = `${position.left}%`;
    button.style.top = `${position.top}%`;

    button.style.animationDelay = `${index * 0.7}s`;

    button.innerHTML = `
      <img src="${character.image}" alt="${character.name}">
      <span class="wanderer-name">${character.name}</span>
    `;

    button.addEventListener("click", () => {
      startWandererStory(character);
    });

    container.appendChild(button);
  });
}

function startWandererStory(character) {
  storyEntryPoint = "wanderer";

  selectedWorld = character.world;
  selectedCharacter = character;
  currentSlide = 0;

  // Встановлюємо фон відкритого космосу
  document.getElementById("story-screen")
    .classList.add("story-screen--space");

  // Встановлюємо персонажа
  document.getElementById("character-sprite").src = character.image;
  document.getElementById("character-sprite").alt = character.name;

  // Інформація про персонажа
  document.getElementById("speaker-name").textContent = character.name;
  document.getElementById("scene-location").textContent = "ВІДКРИТИЙ КОСМОС";

  showScreen(storyScreen);
  renderSlide();
}

const stories = {
  luna: [
    "Сонце знову піднялося над горизонтом. Тут світанки не схожі на земні — повільні, різкі й без жодного звуку.",
    "Мій маршрут мав тривати лише кілька тижнів. Я досі виконую команди, хоча останній сигнал із Землі отримав дуже давно.",
    "Іноді я зупиняюся біля кратера й дивлюся на Землю. Вона здається маленькою блакитною лампою, яку хтось забув вимкнути.",
    "Сьогодні датчики зафіксували дивне відбиття під шаром пилу. Можливо, це просто камінь. Але я хочу перевірити.",
    "Я передаю новий запис у журнал. Якщо хтось колись його почує — знайте: я все ще тут. І я продовжую дослідження."
  ],
  apollo: [
    "Колеса залишають на поверхні слід, який не зітре вітер. Тут майже немає вітру — лише тиша й нескінченний простір.",
    "Мене створили для руху, вимірювань і збору зразків. Ніхто не пояснив, що робити, коли чекати доводиться довше, ніж їхати.",
    "Я знайшов камінь незвичної форми. Зберіг його координати й зробив знімок. Це моя маленька колекція моментів.",
    "Земля зникає за обрієм. На мить здається, що я справді сам у всесвіті. Потім знову вмикається навігація.",
    "Ще один день завершено. Заряду вистачить на наступний. А отже, історія не закінчилася."
  ],
  red: [
    "Пил осідає на корпусі, а горизонт зливається з небом. Марс зустрічає мене кольором і тишею.",
    "Мені доручили шукати ознаки давнього життя. Я перевіряю каміння, ґрунт і кожну підозрілу тріщину.",
    "Сьогодні я побачив сліди, схожі на русло старої річки. Колись тут могла текти вода. Важко уявити це місце іншим.",
    "Зв'язок із Землею переривається. Я зберігаю результати локально — на випадок, якщо сигнал повернеться.",
    "Я не знаю, чи хтось побачить ці знімки. Та кожен новий зразок наближає нас до відповіді."
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

const homeScreen = document.getElementById("home-screen");
const characterScreen = document.getElementById("character-screen");
const storyScreen = document.getElementById("story-screen");
const characterGrid = document.getElementById("character-grid");
let selectedWorld = "moon";
let selectedCharacter = null;
let currentSlide = 0;
let storyEntryPoint = "planet";

function showScreen(screen) {
  [homeScreen, characterScreen, storyScreen].forEach(item => item.classList.remove("is-active"));
  screen.classList.add("is-active");
}

document.querySelectorAll("[data-world]").forEach(button => {
  button.addEventListener("click", () => {
    selectedWorld = button.dataset.world;
    renderCharacters();
    showScreen(characterScreen);
  });
});


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
        <img src="${character.image}" alt="${character.name}">
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
}


function startStory(characterId) {
  storyEntryPoint = "planet";
  document.getElementById("story-screen").classList.remove("story-screen--space");
  selectedCharacter = worlds[selectedWorld].characters.find(item => item.id === characterId);
  currentSlide = 0;
  document.getElementById("story-background").style.backgroundImage = `url("${worlds[selectedWorld].background}")`;
  document.getElementById("character-sprite").src = selectedCharacter.image;
  document.getElementById("character-sprite").alt = selectedCharacter.name;
  document.getElementById("speaker-name").textContent = selectedCharacter.name;
  document.getElementById("scene-location").textContent = worlds[selectedWorld].location;
  showScreen(storyScreen);
  renderSlide();
}

function renderSlide() {
  const story = stories[selectedCharacter.id];
  const isLast = currentSlide === story.length - 1;
  document.getElementById("dialogue-text").textContent = story[currentSlide];
  document.getElementById("progress-label").textContent = `${String(currentSlide + 1).padStart(2, "0")} / ${String(story.length).padStart(2, "0")}`;
  document.getElementById("chapter-label").textContent = `РОЗДІЛ ${String(currentSlide + 1).padStart(2, "0")}`;
  document.getElementById("next-slide").innerHTML = isLast ? 'Спочатку <span aria-hidden="true">↺</span>' : 'Далі <span aria-hidden="true">→</span>';
  const sprite = document.getElementById("character-sprite");
  sprite.style.animation = "none";
  void sprite.offsetWidth;
  sprite.style.animation = "appear .7s ease both";
}

document.getElementById("next-slide").addEventListener("click", () => {
  const story = stories[selectedCharacter.id];
  currentSlide = currentSlide === story.length - 1 ? 0 : currentSlide + 1;
  renderSlide();
});
renderWanderers();
document.getElementById("back-home").addEventListener("click", () => showScreen(homeScreen));
document.getElementById("back-characters").addEventListener("click", () => {

  if (storyEntryPoint === "wanderer") {
    showScreen(homeScreen);
  } else {
    showScreen(characterScreen);
  }

});
document.getElementById("restart-story").addEventListener("click", () => { currentSlide = 0; renderSlide(); });
