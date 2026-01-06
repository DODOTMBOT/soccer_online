import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ------------------------------------------------------------------
// ТИПЫ ДАННЫХ
// ------------------------------------------------------------------

type CountrySeed = {
  name: string
  code: string
  confederation: string
}

type ClubSeed = {
  name: string
  city: string
  stadium: string
  logo: string
  capacity: number
  finances: number
}

// ------------------------------------------------------------------
// 1. СПИСОК СТРАН (ПОЛНЫЙ)
// ------------------------------------------------------------------
const worldCountries: CountrySeed[] = [
  // --- АВСТРАЛИЯ И ОКЕАНИЯ ---
  { name: 'Австралия', code: 'au', confederation: 'AFC' },
  { name: 'Вануату', code: 'vu', confederation: 'OFC' },
  { name: 'Гуам (США)', code: 'gu', confederation: 'AFC' },
  { name: 'Кирибати', code: 'ki', confederation: 'OFC' },
  { name: 'Маршалловы Острова', code: 'mh', confederation: 'OFC' },
  { name: 'Науру', code: 'nr', confederation: 'OFC' },
  { name: 'Ниуэ', code: 'nu', confederation: 'OFC' },
  { name: 'Новая Зеландия', code: 'nz', confederation: 'OFC' },
  { name: 'Новая Каледония', code: 'nc', confederation: 'OFC' },
  { name: 'Остров Норфолк', code: 'nf', confederation: 'OFC' },
  { name: 'Острова Кука', code: 'ck', confederation: 'OFC' },
  { name: 'Палау', code: 'pw', confederation: 'OFC' },
  { name: 'Папуа - Новая Гвинея', code: 'pg', confederation: 'OFC' },
  { name: 'Самоа', code: 'ws', confederation: 'OFC' },
  { name: 'Американское Самоа', code: 'as', confederation: 'OFC' },
  { name: 'Соломоновы Острова', code: 'sb', confederation: 'OFC' },
  { name: 'Тонга', code: 'to', confederation: 'OFC' },
  { name: 'Тувалу', code: 'tv', confederation: 'OFC' },
  { name: 'Фиджи', code: 'fj', confederation: 'OFC' },
  { name: 'Французская Полинезия', code: 'pf', confederation: 'OFC' },
  { name: 'Микронезия', code: 'fm', confederation: 'OFC' },
  // --- ЕВРОПА ---
  { name: 'Австрия', code: 'at', confederation: 'UEFA' },
  { name: 'Албания', code: 'al', confederation: 'UEFA' },
  { name: 'Андорра', code: 'ad', confederation: 'UEFA' },
  { name: 'Беларусь', code: 'by', confederation: 'UEFA' },
  { name: 'Бельгия', code: 'be', confederation: 'UEFA' },
  { name: 'Болгария', code: 'bg', confederation: 'UEFA' },
  { name: 'Босния и Герцеговина', code: 'ba', confederation: 'UEFA' },
  { name: 'Ватикан', code: 'va', confederation: 'UEFA' },
  { name: 'Венгрия', code: 'hu', confederation: 'UEFA' },
  { name: 'Германия', code: 'de', confederation: 'UEFA' },
  { name: 'Гибралтар', code: 'gi', confederation: 'UEFA' },
  { name: 'Греция', code: 'gr', confederation: 'UEFA' },
  { name: 'Дания', code: 'dk', confederation: 'UEFA' },
  { name: 'Ирландия', code: 'ie', confederation: 'UEFA' },
  { name: 'Исландия', code: 'is', confederation: 'UEFA' },
  { name: 'Испания', code: 'es', confederation: 'UEFA' },
  { name: 'Италия', code: 'it', confederation: 'UEFA' },
  { name: 'Косово', code: 'xk', confederation: 'UEFA' },
  { name: 'Латвия', code: 'lv', confederation: 'UEFA' },
  { name: 'Литва', code: 'lt', confederation: 'UEFA' },
  { name: 'Лихтенштейн', code: 'li', confederation: 'UEFA' },
  { name: 'Люксембург', code: 'lu', confederation: 'UEFA' },
  { name: 'Мальта', code: 'mt', confederation: 'UEFA' },
  { name: 'Молдова', code: 'md', confederation: 'UEFA' },
  { name: 'Монако', code: 'mc', confederation: 'UEFA' },
  { name: 'Нидерланды', code: 'nl', confederation: 'UEFA' },
  { name: 'Норвегия', code: 'no', confederation: 'UEFA' },
  { name: 'Польша', code: 'pl', confederation: 'UEFA' },
  { name: 'Португалия', code: 'pt', confederation: 'UEFA' },
  { name: 'Россия', code: 'ru', confederation: 'UEFA' },
  { name: 'Румыния', code: 'ro', confederation: 'UEFA' },
  { name: 'Сан-Марино', code: 'sm', confederation: 'UEFA' },
  { name: 'Северная Македония', code: 'mk', confederation: 'UEFA' },
  { name: 'Сербия', code: 'rs', confederation: 'UEFA' },
  { name: 'Словакия', code: 'sk', confederation: 'UEFA' },
  { name: 'Словения', code: 'si', confederation: 'UEFA' },
  { name: 'Украина', code: 'ua', confederation: 'UEFA' },
  { name: 'Фарерские Острова', code: 'fo', confederation: 'UEFA' },
  { name: 'Финляндия', code: 'fi', confederation: 'UEFA' },
  { name: 'Франция', code: 'fr', confederation: 'UEFA' },
  { name: 'Хорватия', code: 'hr', confederation: 'UEFA' },
  { name: 'Черногория', code: 'me', confederation: 'UEFA' },
  { name: 'Чехия', code: 'cz', confederation: 'UEFA' },
  { name: 'Швейцария', code: 'ch', confederation: 'UEFA' },
  { name: 'Швеция', code: 'se', confederation: 'UEFA' },
  { name: 'Эстония', code: 'ee', confederation: 'UEFA' },
  { name: 'Англия', code: 'gb-eng', confederation: 'UEFA' },
  { name: 'Шотландия', code: 'gb-sct', confederation: 'UEFA' },
  { name: 'Уэльс', code: 'gb-wls', confederation: 'UEFA' },
  { name: 'Северная Ирландия', code: 'gb-nir', confederation: 'UEFA' },
  // --- АЗИЯ ---
  { name: 'Азербайджан', code: 'az', confederation: 'UEFA' },
  { name: 'Армения', code: 'am', confederation: 'UEFA' },
  { name: 'Афганистан', code: 'af', confederation: 'AFC' },
  { name: 'Бангладеш', code: 'bd', confederation: 'AFC' },
  { name: 'Бахрейн', code: 'bh', confederation: 'AFC' },
  { name: 'Бруней', code: 'bn', confederation: 'AFC' },
  { name: 'Бутан', code: 'bt', confederation: 'AFC' },
  { name: 'Восточный Тимор', code: 'tl', confederation: 'AFC' },
  { name: 'Вьетнам', code: 'vn', confederation: 'AFC' },
  { name: 'Гонконг', code: 'hk', confederation: 'AFC' },
  { name: 'Грузия', code: 'ge', confederation: 'UEFA' },
  { name: 'Израиль', code: 'il', confederation: 'UEFA' },
  { name: 'Индия', code: 'in', confederation: 'AFC' },
  { name: 'Индонезия', code: 'id', confederation: 'AFC' },
  { name: 'Иордания', code: 'jo', confederation: 'AFC' },
  { name: 'Ирак', code: 'iq', confederation: 'AFC' },
  { name: 'Иран', code: 'ir', confederation: 'AFC' },
  { name: 'Йемен', code: 'ye', confederation: 'AFC' },
  { name: 'Казахстан', code: 'kz', confederation: 'UEFA' },
  { name: 'Камбоджа', code: 'kh', confederation: 'AFC' },
  { name: 'Катар', code: 'qa', confederation: 'AFC' },
  { name: 'Кипр', code: 'cy', confederation: 'UEFA' },
  { name: 'Кыргызстан', code: 'kg', confederation: 'AFC' },
  { name: 'Китай', code: 'cn', confederation: 'AFC' },
  { name: 'Тайвань', code: 'tw', confederation: 'AFC' },
  { name: 'Кувейт', code: 'kw', confederation: 'AFC' },
  { name: 'Лаос', code: 'la', confederation: 'AFC' },
  { name: 'Ливан', code: 'lb', confederation: 'AFC' },
  { name: 'Макао', code: 'mo', confederation: 'AFC' },
  { name: 'Малайзия', code: 'my', confederation: 'AFC' },
  { name: 'Мальдивы', code: 'mv', confederation: 'AFC' },
  { name: 'Монголия', code: 'mn', confederation: 'AFC' },
  { name: 'Мьянма', code: 'mm', confederation: 'AFC' },
  { name: 'Непал', code: 'np', confederation: 'AFC' },
  { name: 'ОАЭ', code: 'ae', confederation: 'AFC' },
  { name: 'Оман', code: 'om', confederation: 'AFC' },
  { name: 'Пакистан', code: 'pk', confederation: 'AFC' },
  { name: 'Палестина', code: 'ps', confederation: 'AFC' },
  { name: 'Саудовская Аравия', code: 'sa', confederation: 'AFC' },
  { name: 'Северная Корея', code: 'kp', confederation: 'AFC' },
  { name: 'Южная Корея', code: 'kr', confederation: 'AFC' },
  { name: 'Сингапур', code: 'sg', confederation: 'AFC' },
  { name: 'Сирия', code: 'sy', confederation: 'AFC' },
  { name: 'Таджикистан', code: 'tj', confederation: 'AFC' },
  { name: 'Таиланд', code: 'th', confederation: 'AFC' },
  { name: 'Туркменистан', code: 'tm', confederation: 'AFC' },
  { name: 'Турция', code: 'tr', confederation: 'UEFA' },
  { name: 'Узбекистан', code: 'uz', confederation: 'AFC' },
  { name: 'Филиппины', code: 'ph', confederation: 'AFC' },
  { name: 'Шри-Ланка', code: 'lk', confederation: 'AFC' },
  { name: 'Япония', code: 'jp', confederation: 'AFC' },
  // --- АФРИКА ---
  { name: 'Алжир', code: 'dz', confederation: 'CAF' },
  { name: 'Ангола', code: 'ao', confederation: 'CAF' },
  { name: 'Бенин', code: 'bj', confederation: 'CAF' },
  { name: 'Ботсвана', code: 'bw', confederation: 'CAF' },
  { name: 'Буркина-Фасо', code: 'bf', confederation: 'CAF' },
  { name: 'Бурунди', code: 'bi', confederation: 'CAF' },
  { name: 'Габон', code: 'ga', confederation: 'CAF' },
  { name: 'Гамбия', code: 'gm', confederation: 'CAF' },
  { name: 'Гана', code: 'gh', confederation: 'CAF' },
  { name: 'Гвинея', code: 'gn', confederation: 'CAF' },
  { name: 'Гвинея-Бисау', code: 'gw', confederation: 'CAF' },
  { name: 'Джибути', code: 'dj', confederation: 'CAF' },
  { name: 'ДР Конго', code: 'cd', confederation: 'CAF' },
  { name: 'Египет', code: 'eg', confederation: 'CAF' },
  { name: 'Замбия', code: 'zm', confederation: 'CAF' },
  { name: 'Зимбабве', code: 'zw', confederation: 'CAF' },
  { name: 'Кабо-Верде', code: 'cv', confederation: 'CAF' },
  { name: 'Камерун', code: 'cm', confederation: 'CAF' },
  { name: 'Кения', code: 'ke', confederation: 'CAF' },
  { name: 'Коморские Острова', code: 'km', confederation: 'CAF' },
  { name: 'Республика Конго', code: 'cg', confederation: 'CAF' },
  { name: 'Кот-д\'Ивуар', code: 'ci', confederation: 'CAF' },
  { name: 'Лесото', code: 'ls', confederation: 'CAF' },
  { name: 'Либерия', code: 'lr', confederation: 'CAF' },
  { name: 'Ливия', code: 'ly', confederation: 'CAF' },
  { name: 'Маврикий', code: 'mu', confederation: 'CAF' },
  { name: 'Мавритания', code: 'mr', confederation: 'CAF' },
  { name: 'Мадагаскар', code: 'mg', confederation: 'CAF' },
  { name: 'Малави', code: 'mw', confederation: 'CAF' },
  { name: 'Мали', code: 'ml', confederation: 'CAF' },
  { name: 'Марокко', code: 'ma', confederation: 'CAF' },
  { name: 'Мозамбик', code: 'mz', confederation: 'CAF' },
  { name: 'Намибия', code: 'na', confederation: 'CAF' },
  { name: 'Нигер', code: 'ne', confederation: 'CAF' },
  { name: 'Нигерия', code: 'ng', confederation: 'CAF' },
  { name: 'Руанда', code: 'rw', confederation: 'CAF' },
  { name: 'Сан-Томе и Принсипи', code: 'st', confederation: 'CAF' },
  { name: 'Свазиленд (Эсватини)', code: 'sz', confederation: 'CAF' },
  { name: 'Сейшельские Острова', code: 'sc', confederation: 'CAF' },
  { name: 'Сенегал', code: 'sn', confederation: 'CAF' },
  { name: 'Сомали', code: 'so', confederation: 'CAF' },
  { name: 'Судан', code: 'sd', confederation: 'CAF' },
  { name: 'Сьерра-Леоне', code: 'sl', confederation: 'CAF' },
  { name: 'Танзания', code: 'tz', confederation: 'CAF' },
  { name: 'Того', code: 'tg', confederation: 'CAF' },
  { name: 'Тунис', code: 'tn', confederation: 'CAF' },
  { name: 'Уганда', code: 'ug', confederation: 'CAF' },
  { name: 'ЦАР', code: 'cf', confederation: 'CAF' },
  { name: 'Чад', code: 'td', confederation: 'CAF' },
  { name: 'Экваториальная Гвинея', code: 'gq', confederation: 'CAF' },
  { name: 'Эритрея', code: 'er', confederation: 'CAF' },
  { name: 'Эфиопия', code: 'et', confederation: 'CAF' },
  { name: 'ЮАР', code: 'za', confederation: 'CAF' },
  { name: 'Южный Судан', code: 'ss', confederation: 'CAF' },
  // --- СЕВЕРНАЯ АМЕРИКА ---
  { name: 'Американские Виргинские Острова', code: 'vi', confederation: 'CONCACAF' },
  { name: 'Ангилья', code: 'ai', confederation: 'CONCACAF' },
  { name: 'Антигуа и Барбуда', code: 'ag', confederation: 'CONCACAF' },
  { name: 'Аруба', code: 'aw', confederation: 'CONCACAF' },
  { name: 'Багамские Острова', code: 'bs', confederation: 'CONCACAF' },
  { name: 'Барбадос', code: 'bb', confederation: 'CONCACAF' },
  { name: 'Белиз', code: 'bz', confederation: 'CONCACAF' },
  { name: 'Бермудские Острова', code: 'bm', confederation: 'CONCACAF' },
  { name: 'Британские Виргинские Острова', code: 'vg', confederation: 'CONCACAF' },
  { name: 'Гаити', code: 'ht', confederation: 'CONCACAF' },
  { name: 'Гватемала', code: 'gt', confederation: 'CONCACAF' },
  { name: 'Гондурас', code: 'hn', confederation: 'CONCACAF' },
  { name: 'Гренада', code: 'gd', confederation: 'CONCACAF' },
  { name: 'Доминика', code: 'dm', confederation: 'CONCACAF' },
  { name: 'Доминиканская Республика', code: 'do', confederation: 'CONCACAF' },
  { name: 'Каймановы Острова', code: 'ky', confederation: 'CONCACAF' },
  { name: 'Канада', code: 'ca', confederation: 'CONCACAF' },
  { name: 'Коста-Рика', code: 'cr', confederation: 'CONCACAF' },
  { name: 'Куба', code: 'cu', confederation: 'CONCACAF' },
  { name: 'Кюрасао', code: 'cw', confederation: 'CONCACAF' },
  { name: 'Мексика', code: 'mx', confederation: 'CONCACAF' },
  { name: 'Монтсеррат', code: 'ms', confederation: 'CONCACAF' },
  { name: 'Никарагуа', code: 'ni', confederation: 'CONCACAF' },
  { name: 'Панама', code: 'pa', confederation: 'CONCACAF' },
  { name: 'Пуэрто-Рико', code: 'pr', confederation: 'CONCACAF' },
  { name: 'Сальвадор', code: 'sv', confederation: 'CONCACAF' },
  { name: 'Сент-Винсент и Гренадины', code: 'vc', confederation: 'CONCACAF' },
  { name: 'Сент-Китс и Невис', code: 'kn', confederation: 'CONCACAF' },
  { name: 'Сент-Люсия', code: 'lc', confederation: 'CONCACAF' },
  { name: 'США', code: 'us', confederation: 'CONCACAF' },
  { name: 'Тринидад и Тобаго', code: 'tt', confederation: 'CONCACAF' },
  { name: 'Теркс и Кайкос', code: 'tc', confederation: 'CONCACAF' },
  { name: 'Ямайка', code: 'jm', confederation: 'CONCACAF' },
  // --- ЮЖНАЯ АМЕРИКА ---
  { name: 'Аргентина', code: 'ar', confederation: 'CONMEBOL' },
  { name: 'Боливия', code: 'bo', confederation: 'CONMEBOL' },
  { name: 'Бразилия', code: 'br', confederation: 'CONMEBOL' },
  { name: 'Венесуэла', code: 've', confederation: 'CONMEBOL' },
  { name: 'Гайана', code: 'gy', confederation: 'CONCACAF' },
  { name: 'Колумбия', code: 'co', confederation: 'CONMEBOL' },
  { name: 'Парагвай', code: 'py', confederation: 'CONMEBOL' },
  { name: 'Перу', code: 'pe', confederation: 'CONMEBOL' },
  { name: 'Суринам', code: 'sr', confederation: 'CONCACAF' },
  { name: 'Уругвай', code: 'uy', confederation: 'CONMEBOL' },
  { name: 'Чили', code: 'cl', confederation: 'CONMEBOL' },
  { name: 'Эквадор', code: 'ec', confederation: 'CONMEBOL' },
  // --- ТЕРРИТОРИИ ---
  { name: 'Аландские Острова', code: 'ax', confederation: 'UEFA' },
  { name: 'Гернси', code: 'gg', confederation: 'UEFA' },
  { name: 'Гренландия', code: 'gl', confederation: 'UEFA' },
  { name: 'Джерси', code: 'je', confederation: 'UEFA' },
  { name: 'Остров Мэн', code: 'im', confederation: 'UEFA' },
  { name: 'Свальбард', code: 'sj', confederation: 'UEFA' },
  { name: 'Фолклендские Острова', code: 'fk', confederation: 'CONMEBOL' },
  { name: 'Французская Гвиана', code: 'gf', confederation: 'CONCACAF' },
  { name: 'Гваделупа', code: 'gp', confederation: 'CONCACAF' },
  { name: 'Мартиника', code: 'mq', confederation: 'CONCACAF' },
  { name: 'Реюньон', code: 're', confederation: 'CAF' },
]

async function main() {
  console.log('🌍 Начинаем посев данных...')

  // 1. Создаем или получаем активный сезон
  const season = await prisma.season.upsert({
    where: { year: 2025 },
    update: {},
    create: { year: 2025, status: 'ACTIVE' }
  })

  // 2. Функция для создания стран и лиг
  const seedCountryWithClubs = async (
    countryName: string, 
    leagueName: string,
    clubs: ClubSeed[]
  ) => {
    const countryInfo = worldCountries.find(c => c.name === countryName)
    if (!countryInfo) {
      console.log(`⚠️ Ошибка: Страна ${countryName} не найдена!`)
      return
    }

    // Создаем/Обновляем страну
    const country = await prisma.country.upsert({
      where: { name: countryName },
      update: { 
        flag: `https://flagcdn.com/w320/${countryInfo.code}.png`,
        confederation: countryInfo.confederation
      },
      create: {
        name: countryName,
        flag: `https://flagcdn.com/w320/${countryInfo.code}.png`,
        confederation: countryInfo.confederation
      }
    })

    // Создаем Лигу, привязанную к сезону (UncheckedCreate формат)
    let league = await prisma.league.findFirst({
      where: { countryId: country.id, seasonId: season.id, level: 1 }
    })

    if (!league) {
      league = await prisma.league.create({
        data: {
          name: leagueName,
          level: 1,
          teamsCount: clubs.length,
          countryId: country.id, // ID напрямую
          seasonId: season.id    // ID напрямую
        }
      })
      console.log(`   🏆 Создана лига: ${leagueName} (${countryName})`)
    }

    // Создаем Клубы
    for (const club of clubs) {
      await prisma.team.upsert({
        where: { name: club.name },
        update: { logo: club.logo },
        create: {
          name: club.name,
          stadium: club.stadium,
          logo: club.logo,
          baseLevel: 1,
          countryId: country.id,
          leagueId: league.id
        }
      })
    }
  }

  // 3. Загружаем все страны из списка
  for (const c of worldCountries) {
    await prisma.country.upsert({
      where: { name: c.name },
      update: { 
        flag: `https://flagcdn.com/w320/${c.code}.png`, 
        confederation: c.confederation 
      },
      create: { 
        name: c.name, 
        flag: `https://flagcdn.com/w320/${c.code}.png`, 
        confederation: c.confederation 
      }
    })
  }

  // 4. ЗАГРУЗКА КЛУБОВ ПО СТРАНАМ
  await seedCountryWithClubs('Англия', 'Premier League', [
    { name: 'Арсенал', city: 'Лондон', stadium: 'Эмирейтс', capacity: 0, finances: 0, logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/1200px-Arsenal_FC.svg.png' },
    { name: 'Манчестер Сити', city: 'Манчестер', stadium: 'Этихад', capacity: 0, finances: 0, logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/1200px-Manchester_City_FC_badge.svg.png' },
    { name: 'Ливерпуль', city: 'Ливерпуль', stadium: 'Энфилд', capacity: 0, finances: 0, logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Liverpool_FC.svg/1200px-Liverpool_FC.svg.png' },
    { name: 'Челси', city: 'Лондон', stadium: 'Стэмфорд Бридж', capacity: 0, finances: 0, logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/Chelsea_FC.svg/1200px-Chelsea_FC.svg.png' },
    { name: 'Манчестер Юнайтед', city: 'Манчестер', stadium: 'Олд Траффорд', capacity: 0, finances: 0, logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7a/Manchester_United_FC_crest.svg/1200px-Manchester_United_FC_crest.svg.png' },
    { name: 'Тоттенхэм', city: 'Лондон', stadium: 'Тоттенхэм Хотспур', capacity: 0, finances: 0, logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b4/Tottenham_Hotspur.svg/1200px-Tottenham_Hotspur.svg.png' },
    { name: 'Астон Вилла', city: 'Бирмингем', stadium: 'Вилла Парк', capacity: 0, finances: 0, logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f9/Aston_Villa_FC_crest_%282016%29.svg/1200px-Aston_Villa_FC_crest_%282016%29.svg.png' },
    { name: 'Ньюкасл', city: 'Ньюкасл', stadium: 'Сент-Джеймс Парк', capacity: 0, finances: 0, logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Newcastle_United_Logo.svg/1200px-Newcastle_United_Logo.svg.png' },
    { name: 'Вест Хэм', city: 'Лондон', stadium: 'Лондон Стэдиум', capacity: 0, finances: 0, logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c2/West_Ham_United_FC_logo.svg/1200px-West_Ham_United_FC_logo.svg.png' },
    { name: 'Эвертон', city: 'Ливерпуль', stadium: 'Гудисон Парк', capacity: 0, finances: 0, logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7c/Everton_FC_logo.svg/1200px-Everton_FC_logo.svg.png' },
    { name: 'Брайтон', city: 'Брайтон', stadium: 'Амекс', capacity: 0, finances: 0, logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/fd/Brighton_%26_Hove_Albion_logo.svg/1200px-Brighton_%26_Hove_Albion_logo.svg.png' },
    { name: 'Брентфорд', city: 'Лондон', stadium: 'Gtech Community', capacity: 0, finances: 0, logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2a/Brentford_FC_crest.svg/1200px-Brentford_FC_crest.svg.png' },
    { name: 'Вулверхэмптон', city: 'Вулвергемптон', stadium: 'Молинью', capacity: 0, finances: 0, logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/fc/Wolverhampton_Wanderers.svg/1200px-Wolverhampton_Wanderers.svg.png' },
    { name: 'Кристал Пэлас', city: 'Лондон', stadium: 'Селхерст Парк', capacity: 0, finances: 0, logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/Crystal_Palace_FC_logo_%282022%29.svg/1200px-Crystal_Palace_FC_logo_%282022%29.svg.png' },
    { name: 'Борнмут', city: 'Борнмут', stadium: 'Виталити', capacity: 0, finances: 0, logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e5/AFC_Bournemouth_%282013%29.svg/1200px-AFC_Bournemouth_%282013%29.svg.png' },
    { name: 'Бернли', city: 'Бернли', stadium: 'Терф Мур', capacity: 0, finances: 0, logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/62/Burnley_FC_Logo.svg/1200px-Burnley_FC_Logo.svg.png' },
    { name: 'Фулхэм', city: 'Лондон', stadium: 'Крейвен Коттедж', capacity: 0, finances: 0, logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Fulham_FC_%28shield%29.svg/1200px-Fulham_FC_%28shield%29.svg.png' },
  ])

  await seedCountryWithClubs('Испания', 'La Liga', [
    { name: 'Реал Мадрид', city: 'Мадрид', stadium: 'Сантьяго Бернабеу', capacity: 0, finances: 0, logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png' },
    { name: 'Барселона', city: 'Барселона', stadium: 'Камп Ноу', capacity: 0, finances: 0, logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/1200px-FC_Barcelona_%28crest%29.svg.png' },
    { name: 'Атлетико Мадрид', city: 'Мадрид', stadium: 'Цивитас Метрополитано', capacity: 0, finances: 0, logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f4/Atletico_Madrid_2017_logo.svg/1200px-Atletico_Madrid_2017_logo.svg.png' },
  ])

  await seedCountryWithClubs('Россия', 'RPL', [
    { name: 'Зенит', city: 'Санкт-Петербург', stadium: 'Газпром Арена', capacity: 0, finances: 0, logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/FC_Zenit_Saint_Petersburg_logo.svg/1200px-FC_Zenit_Saint_Petersburg_logo.svg.png' },
    { name: 'Спартак', city: 'Москва', stadium: 'Лукойл Арена', capacity: 0, finances: 0, logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/86/FC_Spartak_Moscow_logo.svg/1200px-FC_Spartak_Moscow_logo.svg.png' },
  ])

  await seedCountryWithClubs('Сальвадор', 'Primera Division', [
    { name: 'Марте', city: 'Сан-Сальвадор', stadium: 'Эстадио Кускатлан', capacity: 0, finances: 0, logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2f/Atletico_Marte.png/1200px-Atletico_Marte.png' }
  ])

  console.log('\n🏁 Посев успешно завершен!')
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при посеве:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })