import { httpGet, httpPost, httpDelete } from './http';

export async function saveTranslation(locale, key, value) {
  return httpPost(`i18n/resource/${locale}/value/${key}`, {value});
}

export async function listAllTranslationsForEdit() {
  return httpGet('i18n/resource');
}

export async function flushTranslation() {
  return httpPost('i18n/resource/flush');
}

export async function getTranslationResource(locale) {
  return httpGet(`i18n/resource/${locale}`);
}