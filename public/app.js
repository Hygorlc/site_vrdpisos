'use strict';
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const phone = '555199017137';
const menuButton = $('.menu-toggle');
const navigation = $('#navigation');
function closeMenu() { menuButton.setAttribute('aria-expanded', 'false'); navigation.classList.remove('open'); menuButton.setAttribute('aria-label', 'Abrir menu'); }
menuButton.addEventListener('click', () => { const open = menuButton.getAttribute('aria-expanded') !== 'true'; menuButton.setAttribute('aria-expanded', String(open)); menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu'); navigation.classList.toggle('open', open); });
$$('a', navigation).forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
document.addEventListener('click', event => { if (!event.target.closest('.header')) closeMenu(); });

const tabs = $$('.service-tab');
function selectTab(tab, focus = false) { tabs.forEach(item => { const active = item === tab; item.setAttribute('aria-selected', String(active)); item.tabIndex = active ? 0 : -1; $('#' + item.getAttribute('aria-controls')).hidden = !active; }); if (focus) tab.focus(); }
tabs.forEach((tab, index) => { tab.addEventListener('click', () => selectTab(tab)); tab.addEventListener('keydown', event => { let next; if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length; if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + tabs.length) % tabs.length; if (event.key === 'Home') next = 0; if (event.key === 'End') next = tabs.length - 1; if (next !== undefined) { event.preventDefault(); selectTab(tabs[next], true); } }); });
$$('.choose-service').forEach(button => button.addEventListener('click', () => { $('#service').value = button.dataset.value; $('#contato').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); $('#name').focus({ preventScroll: true }); }));

$$('dialog').forEach(dialog => { $$('[data-close]', dialog).forEach(button => button.addEventListener('click', () => dialog.close())); dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } }); });
const galleryItems = [{"title": "Registro da obra 01", "src": "/assets/gallery/foto-01.jpeg", "type": "image", "alt": "Registro da obra 01"}, {"title": "Registro da obra 02", "src": "/assets/gallery/foto-02.jpeg", "type": "image", "alt": "Registro da obra 02"}, {"title": "Registro da obra 03", "src": "/assets/gallery/foto-03.jpeg", "type": "image", "alt": "Registro da obra 03"}, {"title": "Registro da obra 04", "src": "/assets/gallery/foto-04.jpeg", "type": "image", "alt": "Registro da obra 04"}, {"title": "Registro da obra 05", "src": "/assets/gallery/foto-05.jpeg", "type": "image", "alt": "Registro da obra 05"}, {"title": "Registro da obra 06", "src": "/assets/gallery/foto-06.jpeg", "type": "image", "alt": "Registro da obra 06"}, {"title": "Registro da obra 07", "src": "/assets/gallery/foto-07.jpeg", "type": "image", "alt": "Registro da obra 07"}, {"title": "Registro da obra 08", "src": "/assets/gallery/foto-08.jpeg", "type": "image", "alt": "Registro da obra 08"}, {"title": "Registro da obra 09", "src": "/assets/gallery/foto-09.jpeg", "type": "image", "alt": "Registro da obra 09"}, {"title": "Registro da obra 10", "src": "/assets/gallery/foto-10.jpeg", "type": "image", "alt": "Registro da obra 10"}, {"title": "Registro da obra 11", "src": "/assets/gallery/foto-11.jpeg", "type": "image", "alt": "Registro da obra 11"}, {"title": "Registro da obra 12", "src": "/assets/gallery/foto-12.jpeg", "type": "image", "alt": "Registro da obra 12"}, {"title": "Registro da obra 13", "src": "/assets/gallery/foto-13.jpeg", "type": "image", "alt": "Registro da obra 13"}, {"title": "Registro da obra 14", "src": "/assets/gallery/foto-14.jpeg", "type": "image", "alt": "Registro da obra 14"}];
let galleryIndex = 0;
function renderGallery(index) {
 galleryIndex = (index + galleryItems.length) % galleryItems.length;
 const item = galleryItems[galleryIndex], image = $('#gallery-image');
 image.src = item.src; image.alt = item.alt;
 $('#gallery-title').textContent = item.title;
 $('#gallery-counter').textContent = (galleryIndex + 1) + ' / ' + galleryItems.length;
}
$$('[data-gallery]').forEach(button => button.addEventListener('click', () => { renderGallery(Number(button.dataset.gallery)); $('#gallery-dialog').showModal(); }));
$('#gallery-prev').addEventListener('click', () => renderGallery(galleryIndex - 1));
$('#gallery-next').addEventListener('click', () => renderGallery(galleryIndex + 1));
$('#gallery-dialog').addEventListener('keydown', event => { if (event.key === 'ArrowLeft') { event.preventDefault(); renderGallery(galleryIndex - 1); } if (event.key === 'ArrowRight') { event.preventDefault(); renderGallery(galleryIndex + 1); } });

$('#quote-form').addEventListener('submit', event => { event.preventDefault(); const form = event.currentTarget; const name = $('#name').value.trim(); const city = $('#city').value.trim(); $('#name').setCustomValidity(name ? '' : 'Informe seu nome.'); $('#city').setCustomValidity(city ? '' : 'Informe a cidade da obra.'); if (!form.reportValidity()) return; const service = $('#service').value; const area = $('#area').value; const details = $('#details').value.trim(); const message = ['Olá, VRD! Gostaria de solicitar um orçamento.', '', 'Nome: ' + name, 'Cidade da obra: ' + city, 'Serviço: ' + service, ...(area ? ['Área aproximada: ' + Number(area).toLocaleString('pt-BR') + ' m²'] : []), ...(details ? ['', 'Sobre a obra: ' + details] : []), '', 'Podemos conversar sobre meu projeto?'].join('\n'); $('#message-preview').textContent = message; $('#send-whatsapp').href = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(message); $('#quote-dialog').showModal(); });
['name', 'city'].forEach(id => $('#' + id).addEventListener('input', event => event.currentTarget.setCustomValidity('')));
['privacy-button', 'footer-privacy'].forEach(id => $('#' + id).addEventListener('click', () => $('#privacy-dialog').showModal()));

$('#load-map').addEventListener('click', () => { const frame = document.createElement('iframe'); frame.title = 'Localização da VRD Pisos Industriais em Canoas'; frame.src = 'https://www.google.com/maps?q=' + encodeURIComponent('Rua Moacyr Domingues 22 São José Canoas RS') + '&output=embed'; frame.referrerPolicy = 'no-referrer-when-downgrade'; frame.loading = 'eager'; frame.allowFullscreen = true; const fallback = document.createElement('a'); fallback.href = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Rua Moacyr Domingues 22 São José Canoas RS'); fallback.target = '_blank'; fallback.rel = 'noopener noreferrer'; fallback.className = 'map-fallback'; fallback.textContent = 'Abrir mapa em nova aba ↗'; $('#map-shell').replaceChildren(frame, fallback); });
$('#year').textContent = new Date().getFullYear();
if ('IntersectionObserver' in window) { const anchors = ['empresa', 'servicos', 'galeria', 'contato']; const observer = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) { $$('#navigation a').forEach(a => { const active = a.hash === '#' + entry.target.id; a.classList.toggle('active', active); if (active) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); }); } }); }, { rootMargin: '-15% 0px -60% 0px', threshold: 0 }); anchors.forEach(id => observer.observe($('#' + id))); }
