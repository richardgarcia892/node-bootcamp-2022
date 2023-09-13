/* eslint-disable */

// type is sucess or error
export function showAlert(type, msg) {
  hideAlerts();
  const markup = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlerts, 5000);
}

export function hideAlerts() {
  const element = document.querySelector('.alert');
  if (element) element.parentElement.removeChild(element);
}
