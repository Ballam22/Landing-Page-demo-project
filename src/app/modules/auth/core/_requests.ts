import axios, { AxiosResponse } from "axios";
import { AuthModel, UserModel } from "./_models";

const API_URL = import.meta.env.VITE_APP_API_URL;
const USE_MOCK_AUTH = import.meta.env.VITE_APP_USE_MOCK_AUTH === "true";

/** Mock token used for local dev when `VITE_APP_USE_MOCK_AUTH` is enabled. */
const MOCK_API_TOKEN = "metronic-local-mock-token";

const MOCK_DEMO_USER: UserModel = {
  id: 1,
  username: "demo",
  password: undefined,
  email: "admin@demo.com",
  first_name: "Demo",
  last_name: "User",
  fullname: "Demo User",
  occupation: "Developer",
  companyName: "Keenthemes",
  phone: "5000000000",
  roles: [1],
  pic: "media/avatars/300-3.jpg",
  language: "en",
};

const isMockDemoLogin = (email: string, password: string) =>
  email === "admin@demo.com" && password === "demo";

export const GET_USER_BY_ACCESSTOKEN_URL = `${API_URL}/verify_token`;
export const LOGIN_URL = `${API_URL}/login`;
export const REGISTER_URL = `${API_URL}/register`;
export const REQUEST_PASSWORD_URL = `${API_URL}/forgot_password`;

// Server should return AuthModel
export function login(email: string, password: string) {
  if (USE_MOCK_AUTH && isMockDemoLogin(email, password)) {
    const data: AuthModel = { api_token: MOCK_API_TOKEN };
    return Promise.resolve({ data } as AxiosResponse<AuthModel>);
  }
  return axios.post<AuthModel>(LOGIN_URL, {
    email,
    password,
  });
}

// Server should return AuthModel
export function register(
  email: string,
  firstname: string,
  lastname: string,
  password: string,
  password_confirmation: string
) {
  return axios.post(REGISTER_URL, {
    email,
    first_name: firstname,
    last_name: lastname,
    password,
    password_confirmation,
  });
}

// Server should return object => { result: boolean } (Is Email in DB)
export function requestPassword(email: string) {
  return axios.post<{ result: boolean }>(REQUEST_PASSWORD_URL, {
    email,
  });
}

export function getUserByToken(token: string) {
  if (USE_MOCK_AUTH && token === MOCK_API_TOKEN) {
    return Promise.resolve({ data: { ...MOCK_DEMO_USER } } as AxiosResponse<UserModel>);
  }
  return axios.post<UserModel>(GET_USER_BY_ACCESSTOKEN_URL, {
    api_token: token,
  });
}
