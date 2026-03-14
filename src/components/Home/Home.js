const HOME_BLOCK = "home";

export function Home() {
  return `
    <div class="${HOME_BLOCK}">
      <div class="${HOME_BLOCK}__inner">
        <h1 class="${HOME_BLOCK}__title">Easy-Novel</h1>
        <p class="${HOME_BLOCK}__tagline">Écrire, structurer, avancer</p>
        <p class="${HOME_BLOCK}__description">
          Créez vos romans, gérez personnages et intrigues, rédigez vos scènes et suivez votre progression. Tout reste dans votre navigateur.
        </p>
        <div class="${HOME_BLOCK}__actions">
          <a href="#library" class="${HOME_BLOCK}__cta" data-home-cta="true">Accéder à mes livres</a>
        </div>
        <ul class="${HOME_BLOCK}__features">
          <li class="${HOME_BLOCK}__feature">Bibliothèque de projets</li>
          <li class="${HOME_BLOCK}__feature">Personnages et esquisse</li>
          <li class="${HOME_BLOCK}__feature">Scènes et compteur de mots</li>
          <li class="${HOME_BLOCK}__feature">Structure actes / chapitres</li>
          <li class="${HOME_BLOCK}__feature">Objectifs et export Markdown</li>
        </ul>
      </div>
    </div>
  `;
}

export function hydrateHomeEvents(rootElement) {
  const cta = rootElement.querySelector("[data-home-cta='true']");
  if (cta) {
    cta.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.hash = "#library";
    });
  }
}
