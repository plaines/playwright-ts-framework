# Playwright + TypeScript Automation Framework

Framework básico de automatización con **Playwright Test** y **TypeScript**:

- **UI**: [OrangeHRM demo](https://opensource-demo.orangehrmlive.com/) (login, filtros con dropdowns, checkbox y radio).
- **API**: [FakeStore API](https://fakestoreapi.com/) (GET, POST con payload JSON, caso negativo 401).
- **BDD**: un feature Gherkin ejecutado con [playwright-bdd](https://github.com/vitalets/playwright-bdd).

---

## 1. Requisitos

- Node.js 18+ (probado con Node 24)
- Git

## 2. Instalación

```bash
npm install
npx playwright install chromium firefox webkit
cp .env.example .env
```

Edita `.env` con las credenciales. Las del demo de OrangeHRM se muestran en su propia página de login.
`.env` está en `.gitignore`: **nunca se suben credenciales al repositorio.**

```
TEST_ENV=demo
ORANGEHRM_USERNAME=<usuario>
ORANGEHRM_PASSWORD=<password>
```

## 3. Comandos

| Comando | Qué hace |
|---|---|
| `npm test` | Genera los specs BDD y corre **todo** (api, chromium, firefox, webkit, bdd) |
| `npm run test:api` | Solo pruebas de API |
| `npm run test:chromium` | UI en Chromium |
| `npm run test:firefox` | UI en Firefox |
| `npm run test:webkit` | UI en WebKit |
| `npm run test:bdd` | Feature Gherkin (Chromium) |
| `npm run test:local` | Todo, contra el ambiente `local` |
| `npm run report` | Abre el reporte HTML (`playwright-report/`) |
| `npm run typecheck` | Verifica tipos con `tsc` |

Otros útiles:

```bash
npx playwright test --project=chromium --headed     # ver el navegador
npx playwright test -g "filters users"              # filtrar por nombre
npx playwright show-trace test-results/<carpeta>/trace.zip
```

## 4. Ambientes y configuración

- `configs/environments.json` define los ambientes (`demo`, `local`) con `baseUrl` (UI) y `apiBaseUrl` (API).
- `configs/env.config.ts` lee `TEST_ENV` desde `.env` (o variable del sistema / CI) y expone el objeto `ENV`.
- `playwright.config.ts` usa `ENV.baseUrl` para los proyectos UI y `ENV.apiBaseUrl` para el proyecto `api`.

`local` apunta a instancias levantadas en tu máquina (p. ej. OrangeHRM en Docker en `:8080` y FakeStore API en `:3000`).
Para cambiar de ambiente: `TEST_ENV=local` en `.env`, o `npm run test:local` (usa `cross-env`, funciona en Windows).

## 5. Artefactos de fallo y reporte

Configurado en `playwright.config.ts`:

| Opción | Valor | Motivo |
|---|---|---|
| `screenshot` | `only-on-failure` | Evidencia visual sin costo en pruebas exitosas |
| `trace` | `retain-on-failure` | Trace completo (DOM, red, consola) para depurar |
| `video` | `retain-on-failure` | Ver el flujo exacto que falló |
| `reporter` | `list` + `html` | Salida en consola + reporte navegable |

Los artefactos quedan en `test-results/` y el reporte en `playwright-report/` (`npm run report`).

## 6. Estructura

```
configs/            Configuración: ambientes, lectura de .env, constantes (rutas, labels, opciones)
pom/
  elements/         Clases que SOLO contienen locators
  pages/            Page Objects (comportamiento). BasePage es la clase abstracta
utils/
  api/              Cliente de FakeStore + modelos tipados y esquemas Zod
  assertions.ts     expect personalizado (toMatchSchema, toHaveOnlyText)
  fixtures.ts       test personalizado: inyecta `pages` y `fakeStore`
test-data/
  ui/               Datos para pruebas UI parametrizadas
  api/              Datos para pruebas API parametrizadas
tests/
  api/              Pruebas de API y unitarias del modelo
  ui/               Pruebas de UI
  bdd/features/     Feature Gherkin
  bdd/steps/        Step definitions
docs/
  INTERVIEW_GUIDE.md  Guía para explicar el proyecto en una entrevista
```

## 7. Cómo se cumple cada requisito

### Programación y POO
| Requisito | Dónde |
|---|---|
| Constructores con estado válido | `ProductPayload` valida título y precio en el constructor (`utils/api/models.ts`) |
| Encapsulamiento + getters/setters | `ProductPayload._price` es privado; `get price` / `set price` validan |
| Clase abstracta + implementación heredada | `BasePage` (abstracta) → `LoginPage`, `DashboardPage`, `AdminUsersPage`, `AddEmployeePage` |
| Polimorfismo en tiempo de ejecución | `waitForLoaded()` se sobreescribe en `LoginPage` y `DashboardPage`; `BasePage.open()` llama a la versión del hijo |
| Miembro estático e instancia | `FakeStoreClient.JSON_HEADERS` (estático: igual para todos) y `request` (instancia: uno por test) |
| Responsabilidades pequeñas | Elements = locators, Pages = acciones, Tests = aserciones |

### Automatización UI
- **CSS** en todos los locators. No se necesitó XPath; en `AdminUsersElements.dropdown()` se documenta la alternativa XPath y por qué CSS + `filter` es mejor.
- **Locator encadenado**: `TopBarElements.logoutLink` y `AdminUsersElements.dropdown()`.
- **Dropdown**: filtros *User Role* y *Status* en Admin > User Management.
- **Checkbox + radio**: toggle *Create Login Details* y radios *Enabled/Disabled* en PIM > Add Employee. El formulario **no se guarda**, para no crear datos en el servidor demo compartido.

### Framework y ciclo de vida
- Inyección de dependencias: `page` y `request` (en fixtures), `browser` (test de sesión aislada), `context` (afterEach).
- Fixture personalizado: `utils/fixtures.ts` provee `pages` (colección de page objects) y `fakeStore`.
- Hooks: `beforeEach` (login compartido) y `afterEach` (limpieza de cookies). Lo que pertenece a un test (page, context, request) vive en fixtures de alcance de test.
- Auto-waiting y aserciones web-first; sin `waitForTimeout`. La búsqueda espera la respuesta de la API (`waitForResponse`).
- Aserciones personalizadas con `expect.extend`: `toMatchSchema` y `toHaveOnlyText`.
- `try/catch/finally`:
  - `FakeStoreClient.send()` traduce errores de red a un mensaje claro y vuelve a lanzar (el test falla).
  - `login.spec.ts` cierra en `finally` un contexto creado a mano.

### Configuración y datos
- `.env` + `environments.json` con dos ambientes.
- Locators en `pom/elements`, rutas/labels/opciones en `configs/constants.ts`.
- UI parametrizada: `test-data/ui/user-search.json`, `test-data/ui/invalid-logins.json`.
- API parametrizada: `test-data/api/products.json`.

### API
- `GET /products/{id}` (parametrizado) y `POST /products` (payload JSON, parametrizado).
- Serialización: `JSON.stringify(payload)` usa `ProductPayload.toJSON()`. Deserialización: `response.json()` + validación de esquema Zod.
- Negativo: `POST /auth/login` con credenciales inválidas → `401` y cuerpo `username or password is incorrect`.

### BDD
- `tests/bdd/features/login.feature` (Given/When/Then) + `tests/bdd/steps/login.steps.ts`.
- Los steps reutilizan el mismo fixture `pages` que las pruebas normales.

## 8. Subir a GitHub

```bash
git add .
git commit -m "Initial framework"
git remote add origin https://github.com/<tu-usuario>/playwright-ts-framework.git
git push -u origin main
```
