import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ------------------------------------------------------------------
// ТИПЫ ДАННЫХ
// ------------------------------------------------------------------

type CountrySeed = {
  name: string
  code: string // Код для флага (flagcdn)
  confederation: string
}

type ClubSeed = {
  name: string
  city: string // Временно просто выводим в консоль (пока нет поля в БД)
  stadium: string
  logo: string // Ссылка на логотип
}

// ------------------------------------------------------------------
// 1. СПИСОК СТРАН (ПОЛНЫЙ)
// ------------------------------------------------------------------
const worldCountries: CountrySeed[] = [
  // --- АВСТРАЛИЯ И ОКЕАНИЯ (OFC / AFC) ---
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
  
  // --- ЕВРОПА (UEFA) ---
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

  // --- АЗИЯ (AFC) ---
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

  // --- АФРИКА (CAF) ---
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

  // --- СЕВЕРНАЯ АМЕРИКА (CONCACAF) ---
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

  // --- ЮЖНАЯ АМЕРИКА (CONMEBOL) ---
  { name: 'Аргентина', code: 'ar', confederation: 'CONMEBOL' },
  { name: 'Боливия', code: 'bo', confederation: 'CONMEBOL' },
  { name: 'Бразилия', code: 'br', confederation: 'CONMEBOL' },
  { name: 'Венесуэла', code: 've', confederation: 'CONMEBOL' },
  { name: 'Гайана', code: 'gy', confederation: 'CONCACAF' }, // Гайана играет в CONCACAF
  { name: 'Колумбия', code: 'co', confederation: 'CONMEBOL' },
  { name: 'Парагвай', code: 'py', confederation: 'CONMEBOL' },
  { name: 'Перу', code: 'pe', confederation: 'CONMEBOL' },
  { name: 'Суринам', code: 'sr', confederation: 'CONCACAF' }, // Суринам играет в CONCACAF
  { name: 'Уругвай', code: 'uy', confederation: 'CONMEBOL' },
  { name: 'Чили', code: 'cl', confederation: 'CONMEBOL' },
  { name: 'Эквадор', code: 'ec', confederation: 'CONMEBOL' },

  // --- ТЕРРИТОРИИ БЕЗ СБОРНОЙ (ДЛЯ ПОЛНОТЫ) ---
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

  // 1. Создаем сезон
  await prisma.season.upsert({
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
    // Находим данные страны из списка
    const countryInfo = worldCountries.find(c => c.name === countryName)
    if (!countryInfo) {
      console.log(`⚠️ Ошибка: Страна ${countryName} не найдена в списке worldCountries!`)
      return
    }

    console.log(`\n🌍 Обработка страны: ${countryName}...`)

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

    // Создаем Лигу
    let league = await prisma.league.findFirst({
      where: { countryId: country.id, level: 1 }
    })

    if (!league) {
      league = await prisma.league.create({
        data: {
          name: leagueName,
          level: 1,
          teamsCount: clubs.length,
          countryId: country.id
        }
      })
      console.log(`   🏆 Создана лига: ${leagueName}`)
    }

    // Создаем Клубы
    for (const club of clubs) {
      await prisma.team.upsert({
        where: { name: club.name },
        update: {
          logo: club.logo // Обновляем лого, если изменилось
        },
        create: {
          name: club.name,
          stadium: club.stadium,
          logo: club.logo,
          // Убираем capacity и finances из создания
          baseLevel: 1,
          country: { connect: { id: country.id } },
          league: { connect: { id: league!.id } }
        }
      })
    }
    console.log(`   ✅ Загружено клубов: ${clubs.length}`)
  }

  // 3. Загружаем все страны (даже те, где нет клубов пока)
  for (const c of worldCountries) {
    const flagUrl = `https://flagcdn.com/w320/${c.code}.png`
    await prisma.country.upsert({
      where: { name: c.name },
      update: { flag: flagUrl, confederation: c.confederation },
      create: { name: c.name, flag: flagUrl, confederation: c.confederation }
    })
  }

  // ========================================================
  // 4. ЗАГРУЗКА КЛУБОВ
  // ========================================================

  // АНГЛИЯ
  await seedCountryWithClubs('Англия', 'Premier League', [
    { 
      name: 'Арсенал', 
      city: 'Лондон', 
      stadium: 'Эмирейтс', 
      capacity: 0, finances: 0, // Заглушки, так как поля не нужны
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/1200px-Arsenal_FC.svg.png' 
    },
    { 
      name: 'Манчестер Сити', 
      city: 'Манчестер', 
      stadium: 'Этихад', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/1200px-Manchester_City_FC_badge.svg.png' 
    },
    { 
      name: 'Ливерпуль', 
      city: 'Ливерпуль', 
      stadium: 'Энфилд', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Liverpool_FC.svg/1200px-Liverpool_FC.svg.png' 
    },
    { 
      name: 'Челси', 
      city: 'Лондон', 
      stadium: 'Стэмфорд Бридж', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/Chelsea_FC.svg/1200px-Chelsea_FC.svg.png' 
    },
    { 
      name: 'Манчестер Юнайтед', 
      city: 'Манчестер', 
      stadium: 'Олд Траффорд', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7a/Manchester_United_FC_crest.svg/1200px-Manchester_United_FC_crest.svg.png' 
    },
    { 
      name: 'Тоттенхэм', 
      city: 'Лондон', 
      stadium: 'Тоттенхэм Хотспур', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b4/Tottenham_Hotspur.svg/1200px-Tottenham_Hotspur.svg.png' 
    },
    { 
      name: 'Астон Вилла', 
      city: 'Бирмингем', 
      stadium: 'Вилла Парк', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f9/Aston_Villa_FC_crest_%282016%29.svg/1200px-Aston_Villa_FC_crest_%282016%29.svg.png' 
    },
    { 
      name: 'Ньюкасл', 
      city: 'Ньюкасл', 
      stadium: 'Сент-Джеймс Парк', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Newcastle_United_Logo.svg/1200px-Newcastle_United_Logo.svg.png' 
    },
    { 
      name: 'Вест Хэм', 
      city: 'Лондон', 
      stadium: 'Лондон Стэдиум', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c2/West_Ham_United_FC_logo.svg/1200px-West_Ham_United_FC_logo.svg.png' 
    },
    { 
      name: 'Эвертон', 
      city: 'Ливерпуль', 
      stadium: 'Гудисон Парк', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7c/Everton_FC_logo.svg/1200px-Everton_FC_logo.svg.png' 
    },
    { 
      name: 'Брайтон', 
      city: 'Брайтон', 
      stadium: 'Амекс', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/fd/Brighton_%26_Hove_Albion_logo.svg/1200px-Brighton_%26_Hove_Albion_logo.svg.png' 
    },
    { 
      name: 'Брентфорд', 
      city: 'Лондон', 
      stadium: 'Gtech Community', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2a/Brentford_FC_crest.svg/1200px-Brentford_FC_crest.svg.png' 
    },
    { 
      name: 'Вулверхэмптон', 
      city: 'Вулвергемптон', 
      stadium: 'Молинью', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/fc/Wolverhampton_Wanderers.svg/1200px-Wolverhampton_Wanderers.svg.png' 
    },
    { 
      name: 'Кристал Пэлас', 
      city: 'Лондон', 
      stadium: 'Селхерст Парк', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/Crystal_Palace_FC_logo_%282022%29.svg/1200px-Crystal_Palace_FC_logo_%282022%29.svg.png' 
    },
    { 
      name: 'Борнмут', 
      city: 'Борнмут', 
      stadium: 'Виталити', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e5/AFC_Bournemouth_%282013%29.svg/1200px-AFC_Bournemouth_%282013%29.svg.png' 
    },
    { 
      name: 'Бернли', 
      city: 'Бернли', 
      stadium: 'Терф Мур', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/62/Burnley_FC_Logo.svg/1200px-Burnley_FC_Logo.svg.png' 
    },
    { 
      name: 'Фулхэм', 
      city: 'Лондон', 
      stadium: 'Крейвен Коттедж', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Fulham_FC_%28shield%29.svg/1200px-Fulham_FC_%28shield%29.svg.png' 
    },
  ])

  // ИСПАНИЯ
  await seedCountryWithClubs('Испания', 'La Liga', [
    { 
      name: 'Реал Мадрид', 
      city: 'Мадрид', 
      stadium: 'Сантьяго Бернабеу', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png' 
    },
    { 
      name: 'Барселона', 
      city: 'Барселона', 
      stadium: 'Камп Ноу', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/1200px-FC_Barcelona_%28crest%29.svg.png' 
    },
    { 
      name: 'Атлетико Мадрид', 
      city: 'Мадрид', 
      stadium: 'Цивитас Метрополитано', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f4/Atletico_Madrid_2017_logo.svg/1200px-Atletico_Madrid_2017_logo.svg.png' 
    },
    { 
      name: 'Атлетик Бильбао', 
      city: 'Бильбао', 
      stadium: 'Сан-Мамес', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/98/Club_Athletic_Bilbao_logo.svg/1200px-Club_Athletic_Bilbao_logo.svg.png' 
    },
    { 
      name: 'Севилья', 
      city: 'Севилья', 
      stadium: 'Рамон Санчес Писхуан', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3b/Sevilla_FC_logo.svg/1200px-Sevilla_FC_logo.svg.png' 
    },
    { 
      name: 'Бетис', 
      city: 'Севилья', 
      stadium: 'Бенито Вильямарин', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/13/Real_betis_logo.svg/1200px-Real_betis_logo.svg.png' 
    },
    { 
      name: 'Реал Сосьедад', 
      city: 'Сан-Себастьян', 
      stadium: 'Аноэта', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f1/Real_Sociedad_logo.svg/1200px-Real_Sociedad_logo.svg.png' 
    },
    { 
      name: 'Валенсия', 
      city: 'Валенсия', 
      stadium: 'Месталья', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/ce/Valenciacf.svg/1200px-Valenciacf.svg.png' 
    },
    { 
      name: 'Вильярреал', 
      city: 'Вильярреаль', 
      stadium: 'Эстадио де ла Керамика', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/70/Villarreal_CF_logo.svg/1200px-Villarreal_CF_logo.svg.png' 
    },
    { 
      name: 'Жирона', 
      city: 'Жирона', 
      stadium: 'Монтиливи', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/90/For_Girona_FC.svg/1200px-For_Girona_FC.svg.png' 
    },
    { 
      name: 'Сельта', 
      city: 'Виго', 
      stadium: 'Балаидос', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/12/RC_Celta_de_Vigo_logo.svg/1200px-RC_Celta_de_Vigo_logo.svg.png' 
    },
    { 
      name: 'Осасуна', 
      city: 'Памплона', 
      stadium: 'Эль-Садар', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/55/CA_Osasuna_logo.svg/1200px-CA_Osasuna_logo.svg.png' 
    },
    { 
      name: 'Мальорка', 
      city: 'Пальма', 
      stadium: 'Сон Моис', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/RCD_Mallorca_logo.svg/1200px-RCD_Mallorca_logo.svg.png' 
    },
    { 
      name: 'Райо Вальекано', 
      city: 'Мадрид', 
      stadium: 'Кампо-де-Вальекас', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1f/Rayo_Vallecano_logo.svg/1200px-Rayo_Vallecano_logo.svg.png' 
    },
    { 
      name: 'Хетафе', 
      city: 'Хетафе', 
      stadium: 'Колизеум', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7f/Getafe_CF_logo.svg/1200px-Getafe_CF_logo.svg.png' 
    },
    { 
      name: 'Алавес', 
      city: 'Витория-Гастейс', 
      stadium: 'Мендисорроса', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2e/Deportivo_Alaves_logo.svg/1200px-Deportivo_Alaves_logo.svg.png' 
    },
    { 
      name: 'Эспаньол', 
      city: 'Барселона', 
      stadium: 'RCDE Стэдиум', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d6/Rcd_espanyol_logo.svg/1200px-Rcd_espanyol_logo.svg.png' 
    },
    { 
      name: 'Эльче', 
      city: 'Эльче', 
      stadium: 'Мануэль Мартинес Валеро', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Elche_CF_logo.svg/1200px-Elche_CF_logo.svg.png' 
    },
    { 
      name: 'Леванте', 
      city: 'Валенсия', 
      stadium: 'Сьюдад де Валенсия', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/13/Levante_UD.svg/1200px-Levante_UD.svg.png' 
    },
    { 
      name: 'Реал Овьедо', 
      city: 'Овьедо', 
      stadium: 'Карлос Тартьере', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c9/Real_Oviedo_logo.svg/1200px-Real_Oviedo_logo.svg.png' 
    },
  ])

  // ГЕРМАНИЯ
  await seedCountryWithClubs('Германия', 'Bundesliga', [
    { 
      name: 'Бавария', 
      city: 'Мюнхен', 
      stadium: 'Альянц Арена', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg/1200px-FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg.png' 
    },
    { 
      name: 'Боруссия Дортмунд', 
      city: 'Дортмунд', 
      stadium: 'Сигнал Идуна Парк', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Borussia_Dortmund_logo.svg/1200px-Borussia_Dortmund_logo.svg.png' 
    },
    { 
      name: 'Байер 04', 
      city: 'Леверкузен', 
      stadium: 'Бай-Арена', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/59/Bayer_04_Leverkusen_logo.svg/1200px-Bayer_04_Leverkusen_logo.svg.png' 
    },
    { 
      name: 'РБ Лейпциг', 
      city: 'Лейпциг', 
      stadium: 'Ред Булл Арена', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/04/RB_Leipzig_2014_logo.svg/1200px-RB_Leipzig_2014_logo.svg.png' 
    },
    { 
      name: 'Айнтрахт', 
      city: 'Франкфурт', 
      stadium: 'Дойче Банк Парк', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Eintracht_Frankfurt_Logo.svg/1200px-Eintracht_Frankfurt_Logo.svg.png' 
    },
    { 
      name: 'Боруссия М', 
      city: 'Мёнхенгладбах', 
      stadium: 'Боруссия-Парк', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Borussia_M%C3%B6nchengladbach_logo.svg/1200px-Borussia_M%C3%B6nchengladbach_logo.svg.png' 
    },
    { 
      name: 'Вольфсбург', 
      city: 'Вольфсбург', 
      stadium: 'Фольксваген-Арена', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/VfL_Wolfsburg_Logo.svg/1200px-VfL_Wolfsburg_Logo.svg.png' 
    },
    { 
      name: 'Штутгарт', 
      city: 'Штутгарт', 
      stadium: 'МХП-Арена', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/VfB_Stuttgart_1893_Logo.svg/1200px-VfB_Stuttgart_1893_Logo.svg.png' 
    },
    { 
      name: 'Вердер', 
      city: 'Бремен', 
      stadium: 'Везерштадион', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/SV-Werder-Bremen-Logo.svg/1200px-SV-Werder-Bremen-Logo.svg.png' 
    },
    { 
      name: 'Фрайбург', 
      city: 'Фрайбург', 
      stadium: 'Европа-Парк', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/6d/SC_Freiburg_logo.svg/1200px-SC_Freiburg_logo.svg.png' 
    },
    { 
      name: 'Унион Берлин', 
      city: 'Берлин', 
      stadium: 'Ан дер Альтен Фёрстерай', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/1._FC_Union_Berlin_Logo.svg/1200px-1._FC_Union_Berlin_Logo.svg.png' 
    },
    { 
      name: 'Майнц 05', 
      city: 'Майнц', 
      stadium: 'Мева Арена', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/FSV_Mainz_05_Logo.svg/1200px-FSV_Mainz_05_Logo.svg.png' 
    },
    { 
      name: 'Аугсбург', 
      city: 'Аугсбург', 
      stadium: 'ВВК Арена', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/59/FC_Augsburg_logo.svg/1200px-FC_Augsburg_logo.svg.png' 
    },
    { 
      name: 'Хоффенхайм', 
      city: 'Зинсхайм', 
      stadium: 'ПреЗеро Арена', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Logo_TSG_Hoffenheim.svg/1200px-Logo_TSG_Hoffenheim.svg.png' 
    },
    { 
      name: 'Кёльн', 
      city: 'Кёльн', 
      stadium: 'Рейн Энерги', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/53/FC_Cologne_logo.svg/1200px-FC_Cologne_logo.svg.png' 
    },
    { 
      name: 'Гамбург', 
      city: 'Гамбург', 
      stadium: 'Фолькcпаркштадион', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/HSV-Logo.svg/1200px-HSV-Logo.svg.png' 
    },
    { 
      name: 'Санкт-Паули', 
      city: 'Гамбург', 
      stadium: 'Миллернтор', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/05/FC_St_Pauli_logo.svg/1200px-FC_St_Pauli_logo.svg.png' 
    },
    { 
      name: 'Хайденхайм', 
      city: 'Хайденхайм', 
      stadium: 'Фойт-Арена', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/1._FC_Heidenheim_1846.svg/1200px-1._FC_Heidenheim_1846.svg.png' 
    },
  ])

  // ФРАНЦИЯ
  await seedCountryWithClubs('Франция', 'Ligue 1', [
    { 
      name: 'ПСЖ', 
      city: 'Париж', 
      stadium: 'Парк де Пренс', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Paris_Saint-Germain_F.C..svg/1200px-Paris_Saint-Germain_F.C..svg.png' 
    },
    { 
      name: 'Марсель', 
      city: 'Марсель', 
      stadium: 'Оранж Велодром', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/86/Olympique_Marseille_logo.svg/1200px-Olympique_Marseille_logo.svg.png' 
    },
    { 
      name: 'Лион', 
      city: 'Лион', 
      stadium: 'Групама Арена', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c6/Olympique_Lyonnais.svg/1200px-Olympique_Lyonnais.svg.png' 
    },
    { 
      name: 'Монако', 
      city: 'Монако', 
      stadium: 'Луи II', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/ba/AS_Monaco_FC.svg/1200px-AS_Monaco_FC.svg.png' 
    },
    { 
      name: 'Лилль', 
      city: 'Лилль', 
      stadium: 'Пьер Моруа', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/6f/LOSC_Lille_Logo.svg/1200px-LOSC_Lille_Logo.svg.png' 
    },
    { 
      name: 'Ланс', 
      city: 'Ланс', 
      stadium: 'Боллар-Делелис', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/cc/RC_Lens_logo.svg/1200px-RC_Lens_logo.svg.png' 
    },
    { 
      name: 'Ренн', 
      city: 'Ренн', 
      stadium: 'Роазон Парк', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9e/Stade_Rennais_FC.svg/1200px-Stade_Rennais_FC.svg.png' 
    },
    { 
      name: 'Ницца', 
      city: 'Ницца', 
      stadium: 'Альянц Ривьера', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2e/OGC_Nice_logo.svg/1200px-OGC_Nice_logo.svg.png' 
    },
    { 
      name: 'Нант', 
      city: 'Нант', 
      stadium: 'Божуар', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2b/FC_Nantes_logo.svg/1200px-FC_Nantes_logo.svg.png' 
    },
    { 
      name: 'Страсбур', 
      city: 'Страсбур', 
      stadium: 'Стад де ла Мено', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/80/Racing_Club_de_Strasbourg_Alsace_logo.svg/1200px-Racing_Club_de_Strasbourg_Alsace_logo.svg.png' 
    },
    { 
      name: 'Тулуза', 
      city: 'Тулуза', 
      stadium: 'Стадиум де Тулуз', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8b/Toulouse_FC_logo.svg/1200px-Toulouse_FC_logo.svg.png' 
    },
    { 
      name: 'Брест', 
      city: 'Брест', 
      stadium: 'Стад Франсис Ле Бле', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/05/Stade_Brestois_29_logo.svg/1200px-Stade_Brestois_29_logo.svg.png' 
    },
    { 
      name: 'Лорьян', 
      city: 'Лорьян', 
      stadium: 'Стад дю Мустуар', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3f/FC_Lorient_logo.svg/1200px-FC_Lorient_logo.svg.png' 
    },
    { 
      name: 'Гавр', 
      city: 'Гавр', 
      stadium: 'Стад Осеан', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5c/Le_Havre_AC_logo.svg/1200px-Le_Havre_AC_logo.svg.png' 
    },
    { 
      name: 'Осер', 
      city: 'Осер', 
      stadium: 'Аббе-Дешам', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/52/AJ_Auxerre_logo.svg/1200px-AJ_Auxerre_logo.svg.png' 
    },
    { 
      name: 'Мец', 
      city: 'Мец', 
      stadium: 'Сен-Симфорьен', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4a/FC_Metz_logo.svg/1200px-FC_Metz_logo.svg.png' 
    },
    { 
      name: 'Анже', 
      city: 'Анже', 
      stadium: 'Раймон Копа', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/Angers_SCO_logo.svg/1200px-Angers_SCO_logo.svg.png' 
    },
    { 
      name: 'Париж', 
      city: 'Париж', 
      stadium: 'Стад Шарлети', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/76/Paris_FC_logo.svg/1200px-Paris_FC_logo.svg.png' 
    },
  ])

  // ИТАЛИЯ
  await seedCountryWithClubs('Италия', 'Serie A', [
    { 
      name: 'Интер', 
      city: 'Милан', 
      stadium: 'Джузеппе Меацца', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/FC_Internazionale_Milano_2021.svg/1200px-FC_Internazionale_Milano_2021.svg.png' 
    },
    { 
      name: 'Милан', 
      city: 'Милан', 
      stadium: 'Сан-Сиро', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Logo_of_AC_Milan.svg/1200px-Logo_of_AC_Milan.svg.png' 
    },
    { 
      name: 'Ювентус', 
      city: 'Турин', 
      stadium: 'Альянц Стадиум', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Juventus_FC_2017_icon_%28black%29.svg/1200px-Juventus_FC_2017_icon_%28black%29.svg.png' 
    },
    { 
      name: 'Наполи', 
      city: 'Неаполь', 
      stadium: 'Диего Армандо Марадона', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/SSC_Neapel.svg/1200px-SSC_Neapel.svg.png' 
    },
    { 
      name: 'Рома', 
      city: 'Рим', 
      stadium: 'Олимпийский стадион', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f7/AS_Roma_logo_%282017%29.svg/1200px-AS_Roma_logo_%282017%29.svg.png' 
    },
    { 
      name: 'Лацио', 
      city: 'Рим', 
      stadium: 'Олимпийский стадион', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/ce/S.S._Lazio_badge.svg/1200px-S.S._Lazio_badge.svg.png' 
    },
    { 
      name: 'Аталанта', 
      city: 'Бергамо', 
      stadium: 'Гевисс Стэдиум', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/66/AtalantaBC.svg/1200px-AtalantaBC.svg.png' 
    },
    { 
      name: 'Фиорентина', 
      city: 'Флоренция', 
      stadium: 'Артемио Франки', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/ba/ACF_Fiorentina_2.svg/1200px-ACF_Fiorentina_2.svg.png' 
    },
    { 
      name: 'Болонья', 
      city: 'Болонья', 
      stadium: 'Ренато Далль’Ара', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5b/Bologna_F.C._1909_logo.svg/1200px-Bologna_F.C._1909_logo.svg.png' 
    },
    { 
      name: 'Торино', 
      city: 'Турин', 
      stadium: 'Олимпийский стадион Турина', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2e/Torino_FC_Logo.svg/1200px-Torino_FC_Logo.svg.png' 
    },
    { 
      name: 'Удинезе', 
      city: 'Удине', 
      stadium: 'Блюэнерджи Стэдиум', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/ce/Udinese_Calcio_logo.svg/1200px-Udinese_Calcio_logo.svg.png' 
    },
    { 
      name: 'Сассуоло', 
      city: 'Сассуоло', 
      stadium: 'Мапеи', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1c/US_Sassuolo_Calcio_logo.svg/1200px-US_Sassuolo_Calcio_logo.svg.png' 
    },
    { 
      name: 'Дженоа', 
      city: 'Генуя', 
      stadium: 'Луиджи Феррарис', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/6c/Genoa_C.F.C._logo.svg/1200px-Genoa_C.F.C._logo.svg.png' 
    },
    { 
      name: 'Верона', 
      city: 'Верона', 
      stadium: 'Маркантонио Бентегоди', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/99/Hellas_Verona_FC_logo_%282020%29.svg/1200px-Hellas_Verona_FC_logo_%282020%29.svg.png' 
    },
    { 
      name: 'Лечче', 
      city: 'Лечче', 
      stadium: 'Виа дель Маре', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/ad/U.S._Lecce_logo.svg/1200px-U.S._Lecce_logo.svg.png' 
    },
    { 
      name: 'Кальяри', 
      city: 'Кальяри', 
      stadium: 'Унипол Домус', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/61/Cagliari_Calcio_1920.svg/1200px-Cagliari_Calcio_1920.svg.png' 
    },
    { 
      name: 'Парма', 
      city: 'Парма', 
      stadium: 'Эннио Тардини', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5b/Parma_Calcio_1913_logo.svg/1200px-Parma_Calcio_1913_logo.svg.png' 
    },
    { 
      name: 'Комо', 
      city: 'Комо', 
      stadium: 'Джузеппе Синигалья', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/52/Como_1907_logo.svg/1200px-Como_1907_logo.svg.png' 
    },
    { 
      name: 'Кремонезе', 
      city: 'Кремона', 
      stadium: 'Джованни Дзини', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f6/U.S._Cremonese_logo.svg/1200px-U.S._Cremonese_logo.svg.png' 
    },
    { 
      name: 'Пиза', 
      city: 'Пиза', 
      stadium: 'Арена Гарибальди', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/24/Pisa_Sporting_Club_logo.svg/1200px-Pisa_Sporting_Club_logo.svg.png' 
    },
  ])

  // РОССИЯ
  await seedCountryWithClubs('Россия', 'RPL', [
    { 
      name: 'Зенит', 
      city: 'Санкт-Петербург', 
      stadium: 'Газпром Арена', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/FC_Zenit_Saint_Petersburg_logo.svg/1200px-FC_Zenit_Saint_Petersburg_logo.svg.png' 
    },
    { 
      name: 'Спартак', 
      city: 'Москва', 
      stadium: 'Лукойл Арена', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/86/FC_Spartak_Moscow_logo.svg/1200px-FC_Spartak_Moscow_logo.svg.png' 
    },
    { 
      name: 'ЦСКА', 
      city: 'Москва', 
      stadium: 'ВЭБ Арена', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2a/PFC_CSKA_Moscow_logo.svg/1200px-PFC_CSKA_Moscow_logo.svg.png' 
    },
    { 
      name: 'Локомотив', 
      city: 'Москва', 
      stadium: 'РЖД Арена', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/95/FC_Lokomotiv_Moscow_logo.svg/1200px-FC_Lokomotiv_Moscow_logo.svg.png' 
    },
    { 
      name: 'Динамо Москва', 
      city: 'Москва', 
      stadium: 'ВТБ Арена', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/FC_Dynamo_Moscow_logo.svg/1200px-FC_Dynamo_Moscow_logo.svg.png' 
    },
    { 
      name: 'Краснодар', 
      city: 'Краснодар', 
      stadium: 'Краснодар', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/87/FC_Krasnodar_logo.svg/1200px-FC_Krasnodar_logo.svg.png' 
    },
    { 
      name: 'Ростов', 
      city: 'Ростов-на-Дону', 
      stadium: 'Ростов Арена', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/52/FC_Rostov_logo.svg/1200px-FC_Rostov_logo.svg.png' 
    },
    { 
      name: 'Ахмат', 
      city: 'Грозный', 
      stadium: 'Ахмат Арена', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/FC_Akhmat_Grozny_logo.svg/1200px-FC_Akhmat_Grozny_logo.svg.png' 
    },
    { 
      name: 'Крылья Советов', 
      city: 'Самара', 
      stadium: 'Солидарность Самара Арена', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/FC_Krylia_Sovetov_Samara_logo.svg/1200px-FC_Krylia_Sovetov_Samara_logo.svg.png' 
    },
    { 
      name: 'Рубин', 
      city: 'Казань', 
      stadium: 'Ак Барс Арена', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/6f/FC_Rubin_Kazan_logo.svg/1200px-FC_Rubin_Kazan_logo.svg.png' 
    },
    { 
      name: 'Сочи', 
      city: 'Сочи', 
      stadium: 'Фишт', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/87/PFC_Sochi_logo.svg/1200px-PFC_Sochi_logo.svg.png' 
    },
    { 
      name: 'Оренбург', 
      city: 'Оренбург', 
      stadium: 'Газовик', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/ef/FC_Orenburg_logo.svg/1200px-FC_Orenburg_logo.svg.png' 
    },
    { 
      name: 'Пари НН', 
      city: 'Нижний Новгород', 
      stadium: 'Нижний Новгород', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/ru/thumb/9/90/FC_Pari_Nizhny_Novgorod_logo.svg/1200px-FC_Pari_Nizhny_Novgorod_logo.svg.png' 
    },
    { 
      name: 'Балтика', 
      city: 'Калининград', 
      stadium: 'Ростех Арена', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/ru/thumb/4/41/FC_Baltika_Logo.svg/1200px-FC_Baltika_Logo.svg.png' 
    },
    { 
      name: 'Акрон', 
      city: 'Тольятти', 
      stadium: 'Кристалл', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3f/FC_Akron_Tolyatti_logo.svg/1200px-FC_Akron_Tolyatti_logo.svg.png' 
    },
    { 
      name: 'Динамо Махачкала', 
      city: 'Махачкала', 
      stadium: 'Анжи Арена', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/ru/thumb/d/d4/FC_Dynamo_Makhachkala_logo_2020.png/1200px-FC_Dynamo_Makhachkala_logo_2020.png' 
    },
  ])

  // САЛЬВАДОР (для твоей команды)
  await seedCountryWithClubs('Сальвадор', 'Primera Division', [
    { 
      name: 'Марте', 
      city: 'Сан-Сальвадор', 
      stadium: 'Эстадио Кускатлан', 
      capacity: 0, finances: 0,
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2f/Atletico_Marte.png/1200px-Atletico_Marte.png' 
    }
  ])

  console.log('\n🏁 Посев успешно завершен! База заполнена.')
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при посеве:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })