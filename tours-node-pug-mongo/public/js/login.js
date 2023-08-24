/* eslint-disable */

import { showAlert } from './alerts.js';

const loginForm = document.querySelector('.form--login');
const logoutButton = document.querySelector('.nav__el--logout');

const login = async (email, password) => {
  try {
    const response = await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/users/login',
      data: {
        email,
        password
      }
    });
    if (response.data.status === 'success') {
      window.setTimeout(() => {
        showAlert('success', 'logged in successfully');
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    console.log({ err });
    showAlert('error', err.response.data.message);
    console.log(err.response.data.message);
  }
};

const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://localhost:3000/api/v1/users/logout'
    });
    console.log(res.status);
    if (res.status === 200) {
      window.setTimeout(() => {
        showAlert('success', 'logged out successfully');
        location.assign('/');
      }, 1500);
    }
  } catch (error) {
    showAlert('error', 'An error ocurred, please try again');
  }
};

if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logoutButton) {
  logoutButton.addEventListener('click', logout);
}
