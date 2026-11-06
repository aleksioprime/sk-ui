/**
 * Бренд гимназии и название сервиса.
 * Сервис описывает себя одной строкой: `createBrand('Конкурсы')`, а шапка и футер
 * получают бренд через плагин `skUi` (см. plugin.js).
 */
import { inject } from 'vue'

export const SCHOOL = { name: 'Гимназия Сколково', genitive: 'Гимназии Сколково', url: 'https://gymnasium.sk.ru/' }

/** Хаб приложений гимназии: все платформы и сервисы на одной странице */
export const HUB = { name: 'Приложения Гимназии Сколково', url: 'https://skolhub.ru/' }

export const BRAND_KEY = Symbol('sk-ui:brand')

/**
 * Бренд сервиса: название, логотип (по умолчанию /favicon.svg приложения), гимназия, хаб
 * и заголовок вкладки «Страница - Сервис · Гимназия Сколково».
 */
export function createBrand(serviceName, { logo = '/favicon.svg' } = {}) {
  const SERVICE_NAME = serviceName
  const SERVICE_LOGO = logo
  const base = `${SERVICE_NAME} · ${SCHOOL.name}`
  const pageTitle = (page = '') => (page ? `${page} - ${base}` : base)
  return { SERVICE_NAME, SERVICE_LOGO, SCHOOL, HUB, pageTitle }
}

/** Бренд текущего приложения; без плагина - гимназия без названия сервиса. */
export function useBrand() {
  return inject(BRAND_KEY, null) ?? createBrand('')
}
