/* eslint-disable */

import { showAlert } from './alerts.js';

const updateProfileForm = document.querySelector('.form-user-data');
const updatePasswordForm = document.querySelector('.form-user-settings');

const updateProfile = async data => {
  try {
    const response = await axios({
      method: 'PATCH',
      url: '/api/v1/users/me',
      data
    });
    if (response.data.status === 'success') {
      showAlert('success', 'profile updated successfully');
      window.setTimeout(() => {
        location.reload();
      }, 1500);
    }
  } catch (err) {
    console.log(err);
    console.log(err.response.data.message);
    showAlert('error', err.response.data.message);
  }
};

const updatePassword = async (passwordCurrent, password, passwordConfirm) => {
  try {
    const response = await axios({
      method: 'PATCH',
      url: '/api/v1/users/updateMyPassword',
      data: { passwordCurrent, password, passwordConfirm }
    });
    if (response.data.status === 'success') {
      await axios({ method: 'GET', url: '/api/v1/users/logout' });
      showAlert('success', 'Password updated successfully, please log in again');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    console.log(err);
    console.log(err.response.data.message);
    showAlert('error', err.response.data.message);
  }
};

if (updateProfileForm) {
  updateProfileForm.addEventListener('submit', e => {
    e.preventDefault();
    const form = new FormData();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const photo = document.getElementById('photo').files[0];
    form.append('name', name);
    form.append('email', email);
    form.append('photo', photo);
    const button = document.getElementById('btn--save-profile-data');
    button.innerHTML = 'Updating info...';
    updateProfile(form);
  });
}

if (updatePasswordForm) {
  updatePasswordForm.addEventListener('submit', e => {
    e.preventDefault();
    const passwordCurrent = document.getElementById('password-current');
    const password = document.getElementById('password');
    const passwordConfirm = document.getElementById('password-confirm');
    const button = document.getElementById('btn--update-password');
    button.innerHTML = 'Updating password...';
    updatePassword(passwordCurrent.value, password.value, passwordConfirm.value);
    password.value = '';
    passwordCurrent.value = '';
    passwordConfirm.value = '';
  });
}
