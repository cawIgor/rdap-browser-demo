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
    showStatus('Enter an IPv4 or IPv6 address.', 'error');
    input.focus();
    return;
  }

  setLoading(true);
  result.hidden = true;
  result.replaceChildren();
  showStatus(`Looking up ${address}…`, 'loading');

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
  button.querySelector('.button-label').textContent = loading ? 'Looking up…' : 'Look up';
  input.disabled = loading;
}

function showStatus(message, kind) {
  status.textContent = message;
  status.className = `status status-${kind}`;
  status.hidden = false;
}

function describeError(error) {
  if (error instanceof Rdap.InvalidInputError) {
    return 'This does not look like a valid IP address. Check the format and try again.';
  }
  if (error instanceof Rdap.UnsupportedError) {
    return 'No RDAP server is listed for this address. Private or reserved addresses are generally not searchable.';
  }
  if (error instanceof Rdap.NotFoundError) {
    return 'The RDAP server did not find data for this address.';
  }
  if (error instanceof Rdap.ResponseError) {
    return `The RDAP server returned an error${error.status ? ` (HTTP ${error.status})` : ''}. Try again later.`;
  }
  return 'Could not reach the RDAP server. This may be a network issue or a CORS restriction from the registry. Try again later.';
}

function renderNetwork(network) {
  result.replaceChildren();

  const heading = document.createElement('div');
  heading.className = 'result-heading';

  const headingCopy = document.createElement('div');
  const eyebrow = document.createElement('p');
  eyebrow.className = 'result-eyebrow';
  eyebrow.textContent = 'RDAP result';
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
    source.textContent = 'RDAP source ↗';
    heading.append(source);
  }
  result.append(heading);

  const details = document.createElement('dl');
  details.className = 'details-grid';
  addDetail(details, 'IP version', network.version === 4 ? 'IPv4' : network.version === 6 ? 'IPv6' : null);
  addDetail(details, 'Country in RDAP', network.country);
  addDetail(details, 'Network type', network.type);
  addDetail(details, 'Handle', network.handle);
  addDetail(details, 'Start address', network.startAddress);
  addDetail(details, 'End address', network.endAddress);
  addDetail(details, 'CIDR range', Array.isArray(network.cidrs) ? network.cidrs.join(', ') : null);
  result.append(details);

  const organizations = Array.isArray(network.entities)
    ? network.entities.filter((entity) => entity.org || entity.name)
    : [];

  if (organizations.length) {
    const section = document.createElement('section');
    section.className = 'entities-section';
    const label = document.createElement('h3');
    label.textContent = 'Published organizations and contacts';
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
