const worlds = {
  moon: {
    title: "Місяць",
    location: "МІСЯЦЬ · МОРЕ СПОКОЮ",
    background: "assets/moon.svg",
    characters: [
      { id: "luna", name: "Луна", role: "Дослідниця місячного пилу", description: "Уважна до деталей. Зберігає кожен сигнал і кожну знахідку.", image: "assets/rover-moon.svg" },
      { id: "apollo", name: "Аполлон", role: "Мандрівник", description: "Його маршрут давно вийшов за межі початкового плану.", image: "assets/rover-moon-2.svg" }
    ]
  },
  mars: {
    title: "Марс",
    location: "МАРС · КРАТЕР ЄЗЕРО",
    background: "assets/mars.svg",
    characters: [
      { id: "red", name: "Ред", role: "Геолог", description: "Шукає сліди давньої води серед каміння та піску.", image: "assets/rover-mars.svg" },
      { id: "curiosity", name: "К'юрі", role: "Механік і мрійник", description: "Навіть після поломки не припиняє дивитися на горизонт.", image: "assets/rover-mars-2.svg" }
    ]
  }
};

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
  ]
};

const homeScreen = document.getElementById("home-screen");
const characterScreen = document.getElementById("character-screen");
const storyScreen = document.getElementById("story-screen");
const characterGrid = document.getElementById("character-grid");
let selectedWorld = "moon";
let selectedCharacter = null;
let currentSlide = 0;

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
  document.getElementById("character-eyebrow").textContent = `МІСЦЕ ПРИЗНАЧЕННЯ · ${world.title.toUpperCase()}`;
  characterGrid.innerHTML = world.characters.map(character => `
    <button class="character-card" data-character="${character.id}">
      <img src="${character.image}" alt="${character.name}">
      <span>
        <h3>${character.name}</h3>
        <p>${character.role}<br>${character.description}</p>
        <span class="choose">ОБРАТИ ПЕРСОНАЖА ↗</span>
      </span>
    </button>
  `).join("");

  characterGrid.querySelectorAll("[data-character]").forEach(button => {
    button.addEventListener("click", () => startStory(button.dataset.character));
  });
}

function startStory(characterId) {
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
document.getElementById("back-home").addEventListener("click", () => showScreen(homeScreen));
document.getElementById("back-characters").addEventListener("click", () => showScreen(characterScreen));
document.getElementById("restart-story").addEventListener("click", () => { currentSlide = 0; renderSlide(); });
