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

// ------------------------------------------------------------------
// 2. СПИСОК PLAYSTYLES (НОВАЯ СИСТЕМА)
// ------------------------------------------------------------------
const PLAYSTYLES_DATA = [
  // Атака
  { code: 'FINESSE_SHOT', name: 'Удар на технику', category: 'ATTACK' },
  { code: 'POWER_SHOT', name: 'Мощный удар', category: 'ATTACK' },
  { code: 'TRIVELA', name: 'Тривела', category: 'ATTACK' },
  // Пасы
  { code: 'INCISIVE_PASS', name: 'Разрезающий пас', category: 'PASSING' },
  { code: 'LONG_BALL_PASS', name: 'Длинный пас', category: 'PASSING' },
  { code: 'FIRST_TOUCH', name: 'Первое касание', category: 'PASSING' },
  // Защита
  { code: 'SLIDE_TACKLE', name: 'Подкат', category: 'DEFENSE' },
  { code: 'OFFSIDE_TRAP', name: 'Офсайдная ловушка', category: 'DEFENSE' },
  { code: 'MAN_MARKING', name: 'Опека', category: 'DEFENSE' },
  // Физика
  { code: 'ATHLETICISM', name: 'Атлетизм', category: 'PHYSICAL' },
  // Вратарские
  { code: 'GK_FEET', name: 'Игра ногами', category: 'GOALKEEPER' },
  { code: 'GK_CROSSES', name: 'Игра на выходе', category: 'GOALKEEPER' },
  { code: 'GK_1V1', name: 'Игра 1 в 1', category: 'GOALKEEPER' },
  { code: 'GK_PENALTY', name: 'Отражение пенальти', category: 'GOALKEEPER' },
  // Ментальные
  { code: 'LEADER', name: 'Лидер', category: 'MENTAL' },
  { code: 'ICON', name: 'Кумир', category: 'MENTAL' },
  { code: 'CAPTAIN', name: 'Капитан', category: 'MENTAL' },
  // Стилевые
  { code: 'INTENSIVE_SPEED', name: 'Скорость (Интенсив)', category: 'STYLE' },
  { code: 'TRICKSTER', name: 'Трюкач (Joga)', category: 'STYLE' },
  { code: 'TIKI_TAKA', name: 'Тики Така', category: 'STYLE' },
  { code: 'PRESS_TRIGGER', name: 'Триггер (Прес)', category: 'STYLE' },
  { code: 'DISCIPLINE', name: 'Дисциплина (Автобус)', category: 'STYLE' },
  { code: 'COMPACTNESS', name: 'Компактность (Чоло)', category: 'STYLE' },
];

async function seedPlayStyles() {
  console.log('✨ Seeding PlayStyles...');
  for (const ps of PLAYSTYLES_DATA) {
    await prisma.playStyleDefinition.upsert({
      where: { code: ps.code },
      update: { name: ps.name, category: ps.category },
      create: { 
        code: ps.code, 
        name: ps.name, 
        category: ps.category,
        description: "Описание эффекта будет добавлено позже."
      }
    });
  }
}

async function main() {
  console.log('🌍 Начинаем посев данных...')

  // 1. Заполняем справочник PlayStyles (ЭТО НУЖНО ОСТАВИТЬ)
  await seedPlayStyles();

  // 2. Загружаем все страны из списка (ЭТО НУЖНО ОСТАВИТЬ, чтобы работал импорт)
  console.log('🏳️  Создание стран...')
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

  // --- ВЕСЬ БЛОК С КЛУБАМИ НИЖЕ МЫ УДАЛИЛИ ---
  // Больше никаких seedCountryWithClubs('Англия'...)
  
  console.log('\n🏁 База данных инициализирована (Страны + Стили). Клубов нет.')
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при посеве:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })