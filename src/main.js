import * as Rdap from '@portable/rdap';
import './style.css';

const form = document.querySelector('#lookup-form');
const input = document.querySelector('#ip-address');
const button = document.querySelector('#lookup-button');
const status = document.querySelector('#status');
const result = document.querySelector('#result');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const address = input.value.trim();

  if (!address) {
    showStatus('Saisissez une adresse IPv4 ou IPv6.', 'error');
    input.focus();
    return;
  }

  setLoading(true);
  result.hidden = true;
  result.replaceChildren();
  showStatus(`Recherche de ${address}…`, 'loading');

  try {
    const network = await Rdap.ip(address);
    renderNetwork(network);
    status.hidden = true;
    result.hidden = false;
  } catch (error) {
    showStatus(describeError(error), 'error');
  } finally {
    setLoading(false);
  }
});

function setLoading(loading) {
  button.disabled = loading;
  button.classList.toggle('is-loading', loading);
  button.querySelector('.button-label').textContent = loading ? 'Recherche…' : 'Rechercher';
  input.disabled = loading;
}

function showStatus(message, kind) {
  status.textContent = message;
  status.className = `status status-${kind}`;
  status.hidden = false;
}

function describeError(error) {
  if (error instanceof Rdap.InvalidInputError) {
    return 'Cette adresse IP ne semble pas valide. Vérifiez le format puis réessayez.';
  }
  if (error instanceof Rdap.UnsupportedError) {
    return 'Aucun serveur RDAP n’est répertorié pour cette adresse. Les adresses privées ou réservées ne sont généralement pas recherchables.';
  }
  if (error instanceof Rdap.NotFoundError) {
    return 'Le serveur RDAP n’a pas trouvé de données pour cette adresse.';
  }
  if (error instanceof Rdap.ResponseError) {
    return `Le serveur RDAP a répondu avec une erreur${error.status ? ` (HTTP ${error.status})` : ''}. Réessayez plus tard.`;
  }
  return 'Impossible de joindre le serveur RDAP. Cela peut être un problème réseau ou une restriction CORS du registre. Réessayez plus tard.';
}

function renderNetwork(network) {
  result.replaceChildren();

  const heading = document.createElement('div');
  heading.className = 'result-heading';

  const headingCopy = document.createElement('div');
  const eyebrow = document.createElement('p');
  eyebrow.className = 'result-eyebrow';
  eyebrow.textContent = 'Résultat RDAP';
  const title = document.createElement('h2');
  title.textContent = network.name || input.value.trim();
  headingCopy.append(eyebrow, title);
  heading.append(headingCopy);

  const selfUrl = getSelfUrl(network.raw);
  if (selfUrl) {
    const source = document.createElement('a');
    source.className = 'record-link';
    source.href = selfUrl;
    source.target = '_blank';
    source.rel = 'noreferrer';
    source.textContent = 'Source RDAP ↗';
    heading.append(source);
  }
  result.append(heading);

  const details = document.createElement('dl');
  details.className = 'details-grid';
  addDetail(details, 'Version IP', network.version === 4 ? 'IPv4' : network.version === 6 ? 'IPv6' : null);
  addDetail(details, 'Pays indiqué dans RDAP', network.country);
  addDetail(details, 'Type de réseau', network.type);
  addDetail(details, 'Identifiant', network.handle);
  addDetail(details, 'Adresse de début', network.startAddress);
  addDetail(details, 'Adresse de fin', network.endAddress);
  addDetail(details, 'Plage CIDR', Array.isArray(network.cidrs) ? network.cidrs.join(', ') : null);
  result.append(details);

  const organizations = Array.isArray(network.entities)
    ? network.entities.filter((entity) => entity.org || entity.name)
    : [];

  if (organizations.length) {
    const section = document.createElement('section');
    section.className = 'entities-section';
    const label = document.createElement('h3');
    label.textContent = 'Organisations et contacts publiés';
    const list = document.createElement('ul');
    list.className = 'entity-list';
    for (const entity of organizations) {
      const item = document.createElement('li');
      const name = document.createElement('strong');
      name.textContent = entity.org || entity.name;
      item.append(name);
      if (entity.roles?.length) {
        const role = document.createElement('span');
        role.textContent = entity.roles.join(', ');
        item.append(role);
      }
      list.append(item);
    }
    section.append(label, list);
    result.append(section);
  }
}

function addDetail(list, label, value) {
  if (value === undefined || value === null || value === '') return;
  const wrapper = document.createElement('div');
  wrapper.className = 'detail';
  const term = document.createElement('dt');
  term.textContent = label;
  const description = document.createElement('dd');
  description.textContent = String(value);
  wrapper.append(term, description);
  list.append(wrapper);
}

function getSelfUrl(raw) {
  if (!raw || !Array.isArray(raw.links)) return null;
  const selfLink = raw.links.find((link) => link?.rel === 'self' && typeof link.href === 'string');
  if (!selfLink) return null;

  try {
    const url = new URL(selfLink.href);
    return url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}
