---
title: "Índice Maestro de Fuentes y Analítica Cripto (Market Intelligence & Data Sources)"
category: "01 Negocio / 01 Estrategia & Modelo / Market Research"
workflow: "market-research-intelligence"
skills_used:
  - "market-research-extractor"
  - "competitor-tracker"
author_agents:
  - "market-research-analyst"
  - "research"
status: "approved"
version: "1.1"
created_at: 2026-09-12
updated_at: 2026-09-12
tags:
  - crypto-data
  - market-intelligence
  - coinmarketcap
  - dexscreener
  - defillama
  - rwa
  - solana
  - research
---

# 🌐 Índice Maestro de Fuentes y Analítica Cripto

> [!NOTE]
> **Resumen Ejecutivo:** Compendio estructurado de herramientas, agregadores de precios y terminales de inteligencia on-chain del ecosistema Web3/DeFi/RWA. Diseñado como catálogo de referencia rápida para el equipo de **BRIDS.io** para monitoreo de mercado, benchmarking de liquidez, auditoría de contrapartes, análisis de tokenomics y preparación de métricas para inversores y rondas institucionales.

---

## 🧭 Tabla Rápida de Referencia

| Plataforma | Categoría Principal | Caso de Uso Clave | Modelo | URL Directa |
|---|---|---|---|---|
| **CoinMarketCap** | Agregador de Mercado | Rankings macro, capitalización global, exchanges | Freemium | [coinmarketcap.com](https://coinmarketcap.com/) |
| **CoinGecko** | Agregador Independiente | API de precios neutral, actividad GitHub de proyectos | Freemium | [coingecko.com](https://coingecko.com/) |
| **CryptoRank** | Inteligencia de Mercado | Rondas de VC, ROI de IDOs/IEOs, vesting schedules | Freemium | [cryptorank.io](https://cryptorank.io/) |
| **DexScreener** | DEX & Real-Time On-Chain | Gráficos minuto a minuto de pools descentralizados | Gratis | [dexscreener.com](https://dexscreener.com/) |
| **Birdeye** | Solana & DEX Analytics | Terminal especializado en Solana (Raydium, Orca, Meteora) | Freemium | [birdeye.so](https://birdeye.so/) |
| **GeckoTerminal** | DEX On-Chain | Exploración multi-chain de pools de liquidez DEX | Gratis | [geckoterminal.com](https://geckoterminal.com/) |
| **DEXTools** | Seguridad y DEXs | Score de auditoría rápida de smart contracts, liquidez | Freemium | [dextools.io](https://dextools.io/) |
| **DefiLlama** | Métricas DeFi & TVL | TVL, fees, ingresos reales, tesorerías y stablecoins | 100% Gratis | [defillama.com](https://defillama.com/) |
| **Token Terminal** | Finanzas Fundamentales | Métricas contables tradicionales (P/S, P/E, Cash Flow) | Freemium | [tokenterminal.com](https://tokenterminal.com/) |
| **Dune Analytics** | Big Data & Dashboards SQL | Dashboards comunitarios con consultas SQL a la blockchain | Freemium | [dune.com](https://dune.com/) |
| **Arkham Intelligence** | Inteligencia On-Chain | Desanonimización de entidades, VCs, ballenas y flujos | Gratis | [arkhamintelligence.com](https://arkhamintelligence.com/) |
| **Nansen** | Smart Money Tracking | Seguimiento de billeteras institucionales y ballenas | Prémium | [nansen.ai](https://nansen.ai/) |
| **RootData** | Base de Datos Web3 & VCs | Mapeo de inversores, rondas de financiación de startups | Gratis | [rootdata.com](https://rootdata.com/) |
| **Token Unlocks** | Tokenomics & Emisión | Calendarios de desbloqueo de tokens y presión de venta | Freemium | [token.unlocks.app](https://token.unlocks.app/) |
| **RWA.xyz** | Real World Assets | Métricas de bonos del tesoro, deuda privada y real estate | Freemium | [app.rwa.xyz](https://app.rwa.xyz/) |
| **Solscan** | Explorador Solana | Trazabilidad de transacciones, cuentas y Metaplex NFTs | Gratis | [solscan.io](https://solscan.io/) |

---

## 1. 📊 Agregadores de Precios y Mercado Macro (Estilo CoinMarketCap)

Estas plataformas son la puerta de entrada general para consultar precios spot, volumen de negociación en 24 horas, capitalización circulante (*market cap*) y listados en exchanges centralizados (CEXs):

* **[CoinMarketCap](https://coinmarketcap.com/):**
  * *Propiedad:* Binance Capital Mgmt.
  * *Puntos Fuertes:* Máximo alcance y volumen de tráfico global; seguimiento de miles de activos; cálculo del índice de dominancia de Bitcoin; conversores de divisa y seguimiento de reservas de exchanges (Proof of Reserves).
  * *Cuándo usarlo:* Para tener el pulso de la capitalización macro del mercado y validar el volumen reportado por exchanges centralizados.

* **[CoinGecko](https://coingecko.com/):**
  * *Propiedad:* Gecko Labs (Independiente).
  * *Puntos Fuertes:* Considerado el agregador más neutral y riguroso contra el volumen inflado (*wash trading*); categorización por narrativas (RWA, Solana Ecosystem, DePIN, AI); métricas de actividad de desarrollo en GitHub; API pública líder en la industria.
  * *Cuándo usarlo:* Para análisis fundamental independiente de tokens y categorización sectorial.

* **[CryptoRank](https://cryptorank.io/):**
  * *Puntos Fuertes:* Enfoque analítico orientado a inversores de capital de riesgo y retail avanzado. Proporciona datos de recaudación de fondos (*fundraising rounds*), retorno histórico por plataforma de lanzamiento y cronogramas de desbloqueos (*token unlocks*).
  * *Cuándo usarlo:* Para analizar rondas semilla/serie A de protocolos competidores y vesting de tokens.

* **[CoinCodex](https://coincodex.com/):**
  * *Puntos Fuertes:* Herramientas de seguimiento técnico, alertas de precios, historial de lanzamientos de ICOs/IDOs y algoritmos predictivos basados en ciclos de mercado.

* **[CryptoCompare](https://www.cryptocompare.com/):**
  * *Puntos Fuertes:* Proveedor de datos de grado institucional con índices regulados (integrado en terminales como Refinitiv/Bloomberg).

---

## 2. ⚡ Monitoreo DEX y On-Chain en Tiempo Real

Para activos que cotizan en creadores de mercado automatizados (AMMs) o bolsas descentralizadas (DEXs), donde la información cambia bloque a bloque y no depende de listados en exchanges centralizados:

* **[DexScreener](https://dexscreener.com/):**
  * *Puntos Fuertes:* Velocidad instantánea de refresco; soporte exhaustivo para Solana, Ethereum, Base, Arbitrum, Polygon, etc.; detección automática de liquidez en pools, transacciones individuales de compra/venta y soporte de gráficos TradingView.
  * *Cuándo usarlo:* Para monitoreo en vivo de cualquier token o pool recién creado en la blockchain.

* **[Birdeye](https://birdeye.so/):**
  * *Puntos Fuertes:* El terminal insignia para el **ecosistema Solana** (Raydium, Orca, Meteora, Phoenix). Brinda análisis de carteras de traders (*trader profiles*), flujo de liquidez, mapas de calor y métricas de tenedores (*holders distribution*).
  * *Cuándo usarlo:* Para cualquier investigación operativa o análisis de liquidez en el ecosistema Solana.

* **[GeckoTerminal](https://www.geckoterminal.com/):**
  * *Puntos Fuertes:* La división descentralizada de CoinGecko, ideal para validar pares en AMMs consolidados con respaldo de datos históricos de CoinGecko.

* **[DEXTools](https://www.dextools.io/):**
  * *Puntos Fuertes:* Pionero del monitoreo DEX; incluye el algoritmo `DEXTscore` que evalúa liquidez bloqueada, tenencia de creadores y advertencias de *honeypots* o contratos maliciosos.

---

## 3. 📈 Finanzas Fundamentales, DeFi y Métricas de Protocolo

Para ir más allá del precio especulativo y evaluar la economía real de los protocolos (comisiones cobradas a usuarios, flujos de caja, balances de tesorería y TVL):

* **[DefiLlama](https://defillama.com/):**
  * *Puntos Fuertes:* La herramienta más respetada de todo el ecosistema Web3. Open-source, transparente y sin anuncios pagados.
  * *Módulos Clave:*
    * **TVL por Cadena y Protocolo:** Comparativas de Solana vs Ethereum vs L2s.
    * **Fees & Revenue:** Cuánto dinero en comisiones reales genera un protocolo (Uniswap, Raydium, MakerDAO/Sky, etc.).
    * **Treasuries:** Reservas y fondos en custodia de los equipos y DAOs.
    * **Stablecoins:** Capitalización, emisión y flujos netos de USDC, USDT, etc.
    * **Sección RWA:** Monitoreo exclusivo de protocolos de activos reales tokenizados ([defillama.com/protocols/RWA](https://defillama.com/protocols/RWA)).

* **[Token Terminal](https://tokenterminal.com/):**
  * *Puntos Fuertes:* Trata a los protocolos descentralizados como empresas tradicionales. Calcula ratios de valoración como P/S (*Price to Sales*), P/E (*Price to Earnings*), volumen acumulado, retención de usuarios activos y márgenes de ganancia.
  * *Cuándo usarlo:* Indispensable para preparar comparativas de valuación e ingresos para presentaciones a VCs (Seed / Serie A).

* **[Dune Analytics](https://dune.com/):**
  * *Puntos Fuertes:* Plataforma comunitaria abierta de análisis SQL. Permite consultar eventos on-chain directos y crear paneles visuales a medida.
  * *Dashboards Recomendados:* Dashboards de tokenización de bonos del tesoro (T-Bills), volúmenes de Metaplex en Solana, y métricas de RealT / Lofty.

---

## 4. 🕵️ Inteligencia On-Chain, Smart Money y VCs

Para entender el comportamiento de los grandes participantes del mercado (fondos de capital de riesgo, ballenas institucionales y formadores de mercado):

* **[Arkham Intelligence](https://www.arkhamintelligence.com/):**
  * *Puntos Fuertes:* Motor de inteligencia con desanonimización de billeteras mediante algoritmos de IA y análisis heurístico. Permite rastrear carteras de fondos como a16z, Paradigm, Alameda, Jump, así como reservas de gobiernos y exchanges.
  * *Cuándo usarlo:* Para verificar si un fondo o ballena está acumulando o liquidando posiciones en activos específicos.

* **[Nansen](https://www.nansen.ai/):**
  * *Puntos Fuertes:* La plataforma de referencia para rastreo de *Smart Money*. Clasifica millones de billeteras en categorías dinámicas (fondos, arbitrajistas con alta tasa de éxito, ballenas institucionales).

* **[RootData](https://www.rootdata.com/):**
  * *Puntos Fuertes:* El "Crunchbase" del ecosistema Web3. Directorio exhaustivo de startups cripto, etiquetas de inversores institucionales, financiamientos anunciados y organigramas de equipos fundadores.
  * *Cuándo usarlo:* Para prospección de fondos de inversión, tesis de VCs y mapeo de competidores directos e indirectos.

* **[Token Unlocks](https://token.unlocks.app/):**
  * *Puntos Fuertes:* Cronogramas interactivos de liberación de tokens para inversores y equipos, porcentaje del supply bloqueado vs circulante y fechas críticas de desbloqueo.

---

## 5. 🏢 Inteligencia Específica de Real World Assets (RWA)

Herramientas directas para el sector central de **BRIDS.io** (tokenización inmobiliaria, activos del mundo real y rendimiento estructurado):

* **[RWA.xyz](https://app.rwa.xyz/):**
  * *El estándar de la industria para RWA.*
  * Monitorea la emisión global de:
    * Deuda soberana tokenizada (US Treasury Bills liderados por BlackRock BUIDL, Franklin Templeton BENJI, Ondo OUSG).
    * Deuda privada institucional (Private Credit en Centrifuge, Maple, Goldfinch).
    * Bienes raíces tokenizados (métricas agregadas de plataformas como RealT, Lofty, Blocksquare).
  * *Cuándo usarlo:* Como fuente primaria de datos para el *TAM/SAM/SOM* y los informes de investigación de mercado de BRIDS.

* **[DefiLlama — RWA Category](https://defillama.com/protocols/RWA):**
  * Lista agregada de valor bloqueado en protocolos RWA organizados por red y tipología de activo.

---

## 6. 🔍 Exploradores de Bloques e Infraestructura Base

Para inspeccionar transacciones técnicas, cuentas, programas (smart contracts) y metadatos de tokens:

* **Ecosistema Solana:**
  * **[Solscan](https://solscan.io/):** El explorador más amigable y completo para Solana; visualización detallada de cuentas de tokens, metadatos de Metaplex y llamadas a programas.
  * **[SolanaFM](https://solana.fm/):** Excelente visualizador de flujo de transacciones e interacciones entre programas (CPIs).
  * **[Solana Explorer](https://explorer.solana.com/):** Explorador oficial de la Fundación Solana, esencial para alternar entre `mainnet-beta`, `devnet` y `testnet`.

* **Ecosistema EVM (Referencia):**
  * **[Etherscan](https://etherscan.io/):** Estándar de Ethereum.
  * **[Basescan](https://basescan.org/):** Para transacciones en la L2 de Coinbase.

---

---

## 7. 🏢 Directorio Exhaustivo de Competidores RWA Inmobiliarios (Benchmarking Global)

A partir de la inteligencia extraída de **RWA.xyz**, **DefiLlama**, **RootData**, **CryptoRank** y los registros de emisión on-chain, este directorio consolida a los competidores directos e indirectos de **BRIDS.io** clasificados por tipología de mercado:

### A. Plataformas Retail B2C de Fraccionamiento Inmobiliario ($50 – $100 USD)

#### 1. [RealT](https://realt.co)
* **Link:** [https://realt.co](https://realt.co)
* **Descripción:** Plataforma pionera (fundada en 2019) especializada en la tokenización fraccionada de viviendas residenciales en EE.UU. (Detroit, Cleveland, Chicago). Cada propiedad se aloja en una Delaware LLC independiente y emite tokens ERC-20 que reciben dispersión diaria de alquileres en USDC/xDAI en Gnosis Chain y Ethereum.
* **Por qué es relevante para BRIDS:** Es el competidor con mayor historial operativo de inmuebles residenciales fraccionados (>400 propiedades). Sin embargo, sufre de: (1) fragmentación de red (tuvieron que migrar a Gnosis Chain porque Ethereum hacía inviable la dispersión diaria); (2) falta de protocolo automatizado de recuperación de activos (si un usuario pierde su llave privada, el proceso es manual y complejo); y (3) experiencia de usuario fragmentada para inversores no cripto. BRIDS resuelve esto operando de forma monolítica en Solana con liquidaciones sub-céntricas (<$0.0005 USD) y recuperación biométrica con Stripe Identity + Metaplex Core.

#### 2. [Lofty AI](https://www.lofty.ai)
* **Link:** [https://www.lofty.ai](https://www.lofty.ai)
* **Descripción:** Plataforma estadounidense de inversión inmobiliaria fraccionada con tickets de entrada de $50 USD construida sobre Algorand. Permite adquirir participaciones en viviendas unifamiliares con dividendos de alquiler diarios y gobernanza comunitaria para decisiones de mantenimiento del inmueble.
* **Por qué es relevante para BRIDS:** Demostró el apetito masivo del mercado retail por tickets pequeños ($50-$100) y pasarelas de pago Web2 (tarjetas de crédito y transferencias bancarias ACH). No obstante, al construirse en Algorand quedó completamente aislada del 95% de la liquidez institucional y de la base de usuarios de Solana y Ethereum. Además, su modelo de gobernanza para micro-reparaciones genera fricción y lentitud operativa, a diferencia del modelo de Sponsors B2B de BRIDS donde el promotor mantiene la administración experta.

#### 3. [Homebase](https://homebase.co)
* **Link:** [https://homebase.co](https://homebase.co)
* **Descripción:** Plataforma con sede en EE.UU. que logró el primer hito histórico de tokenizar una propiedad residencial en la red **Solana** bajo la exención federal **Regulation Crowdfunding (Reg CF)** avalada por FINRA y la SEC, fraccionando un inmueble en McAllen, Texas, en tokens SPL con tickets de $100 USD.
* **Por qué es relevante para BRIDS:** Es la prueba empírica ante reguladores estadounidenses de que Solana y los tickets de $100 USD funcionan en cumplimiento estricto. BRIDS toma este precedente y supera su gran debilidad: Homebase no construyó un motor escalable de originación para promotores inmobiliarios (Sponsors B2B) y carecía de plugins de congelación y recuperación formal (Metaplex Core Freeze/Recovery plugins), quedando como una emisión aislada en lugar de una plataforma de escala.

#### 4. [Reental](https://www.reental.co)
* **Link:** [https://www.reental.co](https://www.reental.co)
* **Descripción:** Plataforma líder de tokenización inmobiliaria en España y Latinoamérica, operando sobre Polygon y BNB Chain. Ofrece rendimientos mensuales en USDT provenientes de rentas y plusvalías de reformas residenciales y vacacionales mediante contratos de **préstamos participativos** regulados por la CNMV.
* **Por qué es relevante para BRIDS:** Es el principal referente de mercado en el público hispanohablante. La debilidad estructural de Reental es jurídica: sus usuarios **no son copropietarios del inmueble ni accionistas de una SPV**, sino simples prestamistas acreedores de la sociedad emisora. Si Reental quebrara, los usuarios entran en concurso de acreedores. BRIDS ofrece seguridad institucional real: cada inmueble está blindado en una Delaware Series LLC segregada donde el inversor es dueño de su cuota societaria (*equity real*).

#### 5. [MetaWealth](https://www.metawealth.co)
* **Link:** [https://www.metawealth.co](https://www.metawealth.co)
* **Descripción:** Plataforma europea de inversión inmobiliaria fraccionada con presencia en España, Rumania e Italia. Permite a usuarios retail adquirir fracciones de activos residenciales y comerciales desde $100 USD con una aplicación móvil orientada a simplicidad Web2.
* **Por qué es relevante para BRIDS:** Valida el apetito europeo por la micro-inversión de $100 USD y UX simplificada. Sin embargo, su infraestructura depende de rieles EVM y carece de un modelo estructurado para captar promotores en EE.UU. y América Latina.

#### 6. [Estate Protocol](https://estateprotocol.com)
* **Link:** [https://estateprotocol.com](https://estateprotocol.com)
* **Descripción:** Protocolo de tokenización inmobiliaria fraccionada enfocado en propiedades residenciales y comerciales en Dubai y mercados globales, permitiendo a usuarios internacionales recibir alquileres netos en stablecoins.
* **Por qué es relevante para BRIDS:** Representa el auge de la tokenización de activos de alto rendimiento en Oriente Medio. Al igual que otros operadores en Dubai, carece del blindaje societario en Delaware que exigen los inversores institucionales de EE.UU. y Europa.

#### 7. [Subunit](https://www.subunit.xyz)
* **Link:** [https://www.subunit.xyz](https://www.subunit.xyz)
* **Descripción:** Protocolo on-chain de tokenización inmobiliaria desplegado sobre **Base** (la L2 de Coinbase) con la misión de tokenizar inmuebles residenciales y comerciales aprovechando la distribución retail de Coinbase.
* **Por qué es relevante para BRIDS:** Representa el intento del ecosistema EVM L2 de competir en comisiones bajas. No obstante, Base sigue sujeta a riesgos de secuenciador centralizado, fragmentación de liquidez y carece del ecosistema de metadatos ultra-ligeros que ofrece Metaplex Core en Solana.

---

### B. Infraestructura Tecnológica B2B SaaS y Marca Blanca (Enfoque Desarrollador/GP)

#### 8. [Blocksquare](https://blocksquare.io) & [Oceanpoint](https://app.oceanpoint.fi)
* **Link:** [https://blocksquare.io](https://blocksquare.io) | [https://app.oceanpoint.fi](https://app.oceanpoint.fi)
* **Descripción:** Plataforma europea que provee infraestructura de software llave en mano (B2B SaaS) para que inmobiliarias y promotores tokenicen activos bajo su propia marca, conectándose al protocolo DeFi Oceanpoint para liquidez y staking.
* **Por qué es relevante para BRIDS:** Es el espejo conceptual más exacto del modelo B2B SaaS de BRIDS para promotores. Su gran desventaja radica en su dependencia histórica de la arquitectura Ethereum/EVM: el costo computacional de desplegar contratos individuales y las comisiones de interacción reducen radicalmente el margen de los promotores medianos, algo que la arquitectura de BRIDS en Solana optimiza a costo sub-céntimo.

#### 9. [DigiShares](https://www.digishares.io)
* **Link:** [https://www.digishares.io](https://www.digishares.io)
* **Descripción:** Proveedor SaaS de marca blanca para emisión de activos del mundo real, gestión de tablas de capitalización (*cap table*) y portales de inversión corporativos para desarrolladores inmobiliarios y fondos de inversión privada en EE.UU. y Europa.
* **Por qué es relevante para BRIDS:** Es el competidor SaaS institucional clásico. Sus costes de configuración inicial son sumamente elevados ($30,000 – $60,000+ USD) y su producto es un software corporativo tradicional Web 2.5 que no aprovecha la composabilidad on-chain ni la velocidad de Solana para liquidaciones instantáneas de rentas.

#### 10. [Ctrl Alt](https://ctrlalt.co)
* **Link:** [https://ctrlalt.co](https://ctrlalt.co)
* **Descripción:** Infraestructura británica de tokenización B2B orientada a estructuración de activos alternativos e inmobiliarios, con fuerte despliegue institucional en Dubai bajo el marco regulatorio de VARA y el catastro de Dubai (asociada con Pripco).
* **Por qué es relevante para BRIDS:** Es el principal exponente de infraestructura para gobiernos y silos permisionados. Muestra la debilidad de la "Tokenización 1.0": crean registros catastrales tokenizados pero en silos cerrados sin mercado secundario líquido ni interoperabilidad DeFi.

#### 11. [HoneyBricks](https://www.honeybricks.com)
* **Link:** [https://www.honeybricks.com](https://www.honeybricks.com)
* **Descripción:** Plataforma estadounidense que conecta a promotores inmobiliarios comerciales (multifamiliares clase A y B) con inversores acreditados en Polygon, emitiendo participaciones tokenizadas en Delaware LLCs.
* **Por qué es relevante para BRIDS:** Excelente benchmark en calidad de empaquetado y selección de promotores B2B. Sin embargo, su foco estricto en inversores acreditados deja fuera el 90% de la demanda retail que BRIDS canaliza con tickets desde $100 USD.

#### 12. [T-RIZE Group](https://t-rize.com)
* **Link:** [https://t-rize.com](https://t-rize.com)
* **Descripción:** Plataforma europea institucional enfocada en la originación y sindicación de activos reales mediante instrumentos de deuda tokenizada y estructuración financiera para promotores corporativos.
* **Por qué es relevante para BRIDS:** Benchmark para estructuración de rondas de deuda privada inmobiliaria (*mezzanine financing*) y tarifas de procesamiento B2B.

---

### C. Gigantes Institucionales y Comercialización de Inmuebles Completos

#### 13. [Securitize](https://securitize.io)
* **Link:** [https://securitize.io](https://securitize.io)
* **Descripción:** El líder institucional global de valores digitales, agente de transferencias registrado ante la SEC y broker-dealer operador de un ATS (Alternative Trading System). Socio tecnológico de BlackRock para el fondo BUIDL y de KKR para fondos de crédito privado.
* **Por qué es relevante para BRIDS:** Define el estándar de cumplimiento y validación institucional ante Wall Street. BRIDS no compite de frente por fondos billonarios de Wall Street, sino que conquista la capa intermedia desatendida: los promotores inmobiliarios medianos y el inversor retail que Securitize descarta por sus altos costos de estructuración y requerimientos de acreditación de $100,000+ USD.

#### 14. [Roofstock onChain](https://onchain.roofstock.com)
* **Link:** [https://onchain.roofstock.com](https://onchain.roofstock.com)
* **Descripción:** Brazo Web3 de Roofstock (plataforma tradicional que gestiona miles de millones en transacciones residenciales). Tokeniza viviendas unifamiliares completas asociando el 100% de la titularidad de una LLC en Delaware a un único NFT (ERC-721), permitiendo la compraventa instantánea en OpenSea mediante USDC.
* **Por qué es relevante para BRIDS:** Valida la estructura legal de vincular una Delaware LLC a un NFT. No obstante, su modelo exige adquirir la casa entera ($150,000 – $450,000 USD), eliminando el principio de democratización y fraccionamiento minorista que define a BRIDS.

#### 15. [RedSwan CRE](https://redswan.io)
* **Link:** [https://redswan.io](https://redswan.io)
* **Descripción:** Mercado de bienes raíces comerciales tokenizados en EE.UU. con un pipeline de miles de millones de dólares en activos listados (oficinas, hoteles, naves logísticas), utilizando redes como Hedera y Polymesh.
* **Por qué es relevante para BRIDS:** Demuestra que la tokenización de grandes desarrollos es viable y atractiva para los promotores comerciales (GPs). Sirve de referencia para las fases de escalamiento de BRIDS hacia desarrollos de mayor envergadura.

---

### D. Protocolos de Índices, Títulos Notariales y Composabilidad DeFi

#### 16. [Parcl](https://www.parcl.co)
* **Link:** [https://www.parcl.co](https://www.parcl.co)
* **Descripción:** Protocolo descentralizado construido en **Solana** que permite negociar índices sintéticos de precios inmobiliarios basados en el valor por pie cuadrado/metro cuadrado de ciudades globales (Nueva York, Miami, Londres, etc.).
* **Por qué es relevante para BRIDS:** Parcl demostró la tremenda tracción y apetito que existe en la comunidad de Solana por la temática inmobiliaria (llegó a mover cientos de millones en TVL y volumen). La diferencia fundamental: **Parcl es un derivado sintético especulativo** (no posee casas ni paga dividendos por alquiler); **BRIDS es propiedad de activos físicos reales (equity & rentas en USDC)** respaldados por Delaware SPVs. Parcl educa a los usuarios de Solana sobre bienes raíces y BRIDS les entrega el activo real subyacente.

#### 17. [Propy](https://propy.com)
* **Link:** [https://propy.com](https://propy.com)
* **Descripción:** Plataforma de escrituración digital, contratos inteligentes y custodia notarial para compraventas inmobiliarias tradicionales en EE.UU. Pionera en ejecutar cierres de escrituras notariales directamente en blockchain.
* **Por qué es relevante para BRIDS:** Referente en la interacción entre el derecho notarial estadounidense y los contratos inteligentes. Sus protocolos de closing digital pueden integrarse con los flujos de liquidación de activos de BRIDS al momento del exit o venta final del inmueble.

#### 18. [Propbase](https://www.propbase.kred)
* **Link:** [https://www.propbase.kred](https://www.propbase.kred)
* **Descripción:** Plataforma de tokenización fraccionada de bienes raíces orientada al sudeste asiático, construida sobre la blockchain de alta velocidad Aptos (lenguaje Move).
* **Por qué es relevante para BRIDS:** Representa el benchmarking directo sobre blockchains monolíticas de alto rendimiento fuera de Solana. Permite contrastar la ventaja competitiva de la infraestructura de Solana (Metaplex Core, adopción de Phantom/Solflare, liquidez USDC nativa) frente a ecosistemas emergentes como Aptos.

#### 19. [Fraxtor](https://fraxtor.com)
* **Link:** [https://fraxtor.com](https://fraxtor.com)
* **Descripción:** Plataforma de co-inversión inmobiliaria digital regulada por la Autoridad Monetaria de Singapur (MAS), enfocada en desarrollos residenciales y comerciales en Singapur, Reino Unido y Australia.
* **Por qué es relevante para BRIDS:** Referente en licenciamiento y estructuras de cumplimiento en jurisdicciones financieras de máxima exigencia.

#### 20. [CitaDAO](https://citadao.io)
* **Link:** [https://citadao.io](https://citadao.io)
* **Descripción:** Protocolo DeFi en Ethereum que tokeniza activos inmobiliarios comerciales emitiendo tokens ERC-20 para permitir su uso como garantía (*collateral*) en protocolos de préstamo descentralizados.
* **Por qué es relevante para BRIDS:** Pionero en explorar la composabilidad DeFi con bienes raíces. Su estancamiento operativo evidenció que los altos costos de gas de Ethereum hacen imposible la liquidez de micro-fracciones, reforzando la elección estratégica de Solana por parte de BRIDS.

---

## 🎯 Aplicación Práctica para BRIDS.io

1. **Benchmarking Competitivo de Bienes Raíces RWA:**
   * Utilizar **RWA.xyz** y **DefiLlama (RWA)** para comparar el TVL y APY ofertado por plataformas competidoras (RealT, Blocksquare, Lofty).
2. **Validación de Métricas para Inversores y YC:**
   * Obtener múltiplos financieros de protocolos Web3 en **Token Terminal** para respaldar las proyecciones financieras y modelos de valoración SaaS en Delaware.
3. **Mapeo de Fondos y VCs:**
   * Consultar **RootData** y **CryptoRank** para identificar qué fondos de capital de riesgo están invirtiendo activamente en infraestructura RWA en Solana.
4. **Monitoreo On-Chain en Solana:**
   * Auditar liquidez y actividad de contratos con **Birdeye** y **Solscan** durante despliegues en Devnet y Mainnet.

---

## 🔄 Historial de Revisiones (Changelog)
- **v1.1 (2026-09-12):** Integración del directorio exhaustivo de 20 competidores globales de Real Estate RWA clasificados por modelo operativo (Retail B2C, B2B SaaS, Institucional, Derivados/DeFi) con enlaces, descripción y análisis de relevancia para el benchmarking de BRIDS.io, auditado por `market-research-analyst` y `research`.
- **v1.0 (2026-09-12):** Creación inicial del catálogo maestro de plataformas de inteligencia y datos cripto/RWA.

---

## 🔗 Referencias Cruzadas
- Benchmark de competidores RWA: [[01 Negocio/01 Estrategia & Modelo/market-research/rwa-real-estate-competitor-benchmark.md]]
- Benchmark de tokenización en Dubai/EAU: [[01 Negocio/01 Estrategia & Modelo/market-research/research-uae-dubai-tokenization-benchmarks.md]]
- Conceptos maestros de negocio: [[01 Negocio/01 Estrategia & Modelo/master-business-concepts.md]]
- Especificación técnica de Solana: [[01 Negocio/02 Producto & Ingenieria/arquitectura/solana-stack-spec.md]]
