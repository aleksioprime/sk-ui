import { BRAND_KEY, createBrand } from './brand.js'

/**
 * Плагин приложения: `app.use(skUi, { serviceName: 'Конкурсы' })` или `app.use(skUi, { brand })`.
 * Передаёт бренд сервиса в BrandMark, SchoolFooter и другие компоненты пакета.
 */
export const skUi = {
  install(app, options = {}) {
    const brand = options.brand ?? createBrand(options.serviceName ?? '', { logo: options.logo })
    app.provide(BRAND_KEY, brand)
  },
}
