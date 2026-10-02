# Guía para entrevista: Framework Playwright + TypeScript

Cómo presentar este proyecto y responder las preguntas técnicas más comunes.
Cada respuesta apunta al archivo donde está el ejemplo para que puedas mostrar código real.

---

## 1. Pitch de 1 minuto

> "Construí un framework básico con Playwright Test y TypeScript que cubre UI, API y BDD.
> Para UI uso OrangeHRM con Page Object Model: separo los **locators** (`pom/elements`) de las **acciones** (`pom/pages`),
> y todas las páginas heredan de una clase abstracta `BasePage`. Un **fixture personalizado** inyecta los page objects
> y un cliente de API en cada test. Para API automaticé FakeStore con modelos tipados y validación de esquemas con Zod,
> incluyendo un caso negativo 401. Las pruebas están **parametrizadas** desde JSON, corren en **Chromium, Firefox y WebKit**,
> el ambiente se elige con `.env`, y en fallos se guardan screenshot, video y trace. Además hay un feature Gherkin
> conectado con playwright-bdd que reutiliza los mismos fixtures."

## 2. Demo sugerida (5 minutos)

1. `README.md` → estructura de carpetas.
2. `pom/pages/BasePage.ts` → abstracción y polimorfismo.
3. `utils/fixtures.ts` → fixture personalizado.
4. `tests/ui/admin-users.spec.ts` → hooks, parametrización, aserción custom.
5. `tests/api/products.spec.ts` → GET/POST/negativo + esquema.
6. `tests/bdd/features/login.feature` → BDD.
7. Ejecutar `npm run test:chromium` y luego `npm run report`.

---

## 3. Preguntas de POO

**¿Qué es el encapsulamiento y dónde lo usas?**
Ocultar el estado interno y exponerlo de forma controlada. En `ProductPayload` (`utils/api/models.ts`) el precio es `private _price`;
solo se cambia con `set price`, que valida. Así el objeto nunca queda con un precio inválido.

**¿Para qué sirve el constructor aquí?**
Para garantizar que el objeto nace válido. `new ProductPayload({...price: -1})` lanza error; no existe un payload "a medias".
Lo pruebo en `tests/api/product-payload.spec.ts`.

**¿Clase abstracta o interfaz? ¿Por qué elegiste clase abstracta?**
Una interfaz solo define el contrato; una clase abstracta además comparte código. `BasePage` comparte `open()` y una implementación
por defecto de `waitForLoaded()`, y obliga a cada hijo a definir `path`. Como hay código común, la clase abstracta es mejor.

**Muéstrame polimorfismo en tiempo de ejecución.**
`BasePage.open()` llama a `this.waitForLoaded()`. Si el objeto es un `LoginPage`, se ejecuta su versión sobreescrita (espera el botón de login);
si es un `DashboardPage`, la suya (espera el título "Dashboard"). La decisión se toma en tiempo de ejecución según el tipo real del objeto.

**¿Por qué un miembro estático y uno de instancia?**
`FakeStoreClient.JSON_HEADERS` es estático porque es igual para todos los clientes: pertenece a la clase.
`request` es de instancia porque cada test recibe su propio `APIRequestContext`; compartirlo rompería el aislamiento.
`ProductPayload.validatePrice` también es estático: no depende de ningún objeto.

**¿Herencia vs composición?**
Uso ambas. Las páginas **heredan** de `BasePage` (es-un), pero **componen** sus elements (`LoginPage` *tiene* un `LoginElements`, `DashboardPage` *tiene* un `TopBarElements`).
Prefiero composición cuando no hay relación "es-un".

**¿Qué abstracción evitaste a propósito?**
No creé una `BaseElements` ni un "PageManager" con lógica: la colección de páginas es un objeto simple en el fixture. No aportaban nada al escenario.

---

## 4. Preguntas de Playwright / UI

**¿Por qué CSS y no XPath?**
CSS es más corto, más rápido de leer y menos frágil ante cambios de estructura. XPath solo lo usaría para navegar hacia arriba
o por texto cuando no hay alternativa. Aquí `locator().filter({ has })` resuelve "el select cuyo label es X" sin XPath.
La alternativa XPath está documentada en `AdminUsersElements.dropdown()`.

**¿Qué es un locator encadenado?**
Un locator que busca dentro de otro: `page.locator('.oxd-userdropdown-menu').locator('a[href*="logout"]')`. Reduce el alcance y evita coincidencias en otras partes de la página.

**¿Cómo manejas el dropdown de OrangeHRM?**
No es un `<select>` nativo, así que `selectOption()` no sirve. Hago click en el contenedor `.oxd-select-text` y luego en la opción `[role="option"]` con el texto exacto.

**¿Cómo pruebas el checkbox si el input está oculto?**
Hago click en el elemento visible (el `label` del switch) como lo haría un usuario, y verifico el estado en el `input[type="checkbox"]` real con `toBeChecked()`.

**¿Cómo evitas los `sleep`?**
- Las acciones (`click`, `fill`) esperan solas a que el elemento sea visible, estable y habilitado (auto-waiting).
- Las aserciones web-first (`toHaveText`, `toBeChecked`, `toHaveURL`) reintentan hasta el timeout.
- Para la búsqueda espero la respuesta de red: `page.waitForResponse(...)` en `AdminUsersPage.search()`.
- Mi matcher `toHaveOnlyText` usa `expect.poll` para reintentar.

**¿Qué diferencia hay entre `expect(locator).toHaveText()` y `expect(await locator.textContent()).toBe()`?**
La primera reintenta hasta que se cumpla (web-first). La segunda lee una sola vez y puede fallar por timing (flaky).

---

## 5. Preguntas de framework

**¿Qué es un fixture y por qué no usar solo `beforeEach`?**
Un fixture es una dependencia que Playwright crea, inyecta y destruye por ti. Solo se crea si el test lo pide, tiene alcance (test/worker) y limpia automáticamente.
`beforeEach` lo uso para pasos compartidos del flujo (abrir login, iniciar sesión). Lo que *pertenece* a un test (page, context, request, page objects) va en fixtures.

**¿Qué fixtures nativos usas?**
`page`, `context` (afterEach), `browser` (crear un contexto aislado) y `request` (cliente de API). Más mis fixtures `pages` y `fakeStore`.

**¿Para qué es el `try/finally` en `login.spec.ts`?**
El contexto creado con `browser.newContext()` no lo maneja ningún fixture, así que debo cerrarlo yo. `finally` lo cierra aunque la aserción falle, y el error sigue propagándose, así que el test falla igual.

**¿Y el `try/catch` en `FakeStoreClient`?**
Traducción de errores: un error de red se re-lanza con método y URL para que el reporte sea claro. Nunca lo "trago": vuelvo a lanzar (`throw`) con `cause`.

**¿Cómo personalizaste `expect`?**
Con `expect.extend` en `utils/assertions.ts`. Mantengo la sintaxis nativa: `expect(body).toMatchSchema(ProductSchema)` y `await expect(cells).toHaveOnlyText('Admin')`.

**¿Cómo corres en varios navegadores?**
Con *projects* en `playwright.config.ts`: `chromium`, `firefox`, `webkit` (UI), `api` (sin navegador) y `bdd`. Se eligen con `--project=<nombre>`.

**¿Por qué el proyecto `api` está separado?**
Las pruebas de API no usan navegador; si estuvieran en los proyectos de UI correrían 3 veces sin necesidad.

**¿Qué guardas cuando falla un test?**
Screenshot, video y trace (`retain-on-failure`). Solo en fallos, para no hacer lentas las ejecuciones exitosas. El trace se abre con `npx playwright show-trace`.

---

## 6. Configuración y datos

**¿Cómo cambias de ambiente?**
`TEST_ENV` en `.env` (o variable del sistema / CI) selecciona una entrada de `configs/environments.json`. Si el valor no existe, falla rápido con un mensaje claro.

**¿Cómo proteges las credenciales?**
Viven en `.env`, que está en `.gitignore`. El repo solo tiene `.env.example` vacío. En CI vendrían de *secrets*.
`ENV.credentials` es un getter perezoso: las pruebas de API no fallan si no hay credenciales de UI.

**¿Dónde van locators, constantes y datos?**
Locators → `pom/elements`. Rutas, labels y opciones estables → `configs/constants.ts`. Datos de prueba → `test-data/ui` y `test-data/api`.

**¿Cómo parametrizas?**
Un `for...of` sobre el JSON que genera un `test()` por fila, con el dato en el título para que el reporte sea claro.

---

## 7. API testing

**¿Qué endpoints automatizaste?**
`GET /products/{id}`, `POST /products` (payload JSON) y `POST /auth/login` (negativo).

**¿Cómo serializas y deserializas?**
Serializo con `JSON.stringify(payload)`, que llama a `ProductPayload.toJSON()`. Deserializo con `response.json()` y valido con Zod.

**¿Por qué Zod?**
Define el esquema una vez y obtengo tanto la validación en tiempo de ejecución como el tipo TypeScript (`z.infer`). Detecta campos faltantes o con tipo incorrecto.

**¿Cuál es el caso negativo?**
Login con credenciales inválidas: espero `401` y el cuerpo exacto `username or password is incorrect`.

**Detalle a mencionar:** FakeStore es una API de prueba: el `POST` responde 201 con un id, pero no persiste el producto. Por eso no hago un GET posterior.

---

## 8. BDD y estrategia

**¿Cómo conectaste Gherkin con Playwright?**
Con `playwright-bdd`: `bddgen` convierte el `.feature` en specs de Playwright, y los steps se crean con `createBdd(test)` usando **mi** fixture,
así reutilizan los mismos page objects y corren con el mismo runner, reporte y artefactos.

**¿Cuándo usarías BDD y cuándo no?**
Sirve cuando negocio/QA/dev comparten los escenarios. Para pruebas técnicas (API, validaciones de esquema) agrega una capa que no aporta; ahí uso Playwright directo.

**¿Qué probarías primero en una app nueva?**
Flujos críticos de negocio (login, flujo principal) como smoke; la mayoría de validaciones en API (más rápidas y estables); y pocos E2E de UI. Pirámide de pruebas.

**¿Cómo evitas pruebas flaky?**
Locators estables, aserciones web-first, esperar eventos reales (respuestas de red) en lugar de tiempos fijos, tests independientes (cada uno con su propio contexto) y no depender de datos que otro test crea.

**¿Qué mejorarías?**
- Guardar la sesión con `storageState` en un proyecto *setup* para no hacer login en cada test.
- Pipeline de CI (GitHub Actions) con el reporte como artefacto.
- Crear y limpiar datos propios vía API en lugar de depender de los datos del demo.

---

## 9. Chuleta rápida

| Concepto | Archivo |
|---|---|
| Clase abstracta | `pom/pages/BasePage.ts` |
| Override / polimorfismo | `LoginPage.waitForLoaded`, `DashboardPage.waitForLoaded` |
| Encapsulamiento + getter/setter | `utils/api/models.ts` (`ProductPayload`) |
| Static vs instancia | `utils/api/FakeStoreClient.ts` |
| Locator encadenado | `pom/elements/TopBarElements.ts`, `AdminUsersElements.ts` |
| Fixture personalizado | `utils/fixtures.ts` |
| Expect personalizado | `utils/assertions.ts` |
| try/catch | `FakeStoreClient.send()` |
| try/finally | `tests/ui/login.spec.ts` |
| Hooks | `tests/ui/admin-users.spec.ts` |
| UI parametrizada | `admin-users.spec.ts`, `login.spec.ts` |
| API parametrizada | `tests/api/products.spec.ts` |
| Ambientes | `configs/environments.json`, `configs/env.config.ts` |
| Artefactos | `playwright.config.ts` |
| BDD | `tests/bdd/` |
